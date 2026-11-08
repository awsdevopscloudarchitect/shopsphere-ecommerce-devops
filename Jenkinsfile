pipeline {
  agent any
  options { timestamps(); disableConcurrentBuilds() }
  environment {
    AWS_DEFAULT_REGION = 'ap-south-1'
    ECR_REPOSITORY = 'shopsphere'
    S3_BUCKET = 'REPLACE_WITH_YOUR_ARTIFACT_BUCKET'
    EKS_CLUSTER = 'REPLACE_WITH_YOUR_EKS_CLUSTER'
    K8S_NAMESPACE = 'shopsphere'
    HELM_RELEASE = 'shopsphere'
    SONARQUBE_SERVER = 'sonarqube'
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Build and Test') {
      steps { sh 'mvn -B clean verify' }
      post { always { junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml' } }
    }
    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv("${SONARQUBE_SERVER}") {
          sh 'mvn -B sonar:sonar'
        }
      }
    }
    stage('Upload JAR to S3') {
      steps {
        sh 'aws s3 cp target/shopsphere.jar s3://${S3_BUCKET}/artifacts/${BUILD_NUMBER}/shopsphere.jar'
      }
    }
    stage('Build and Push Docker Image') {
      steps {
        sh '''
          ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
          REGISTRY=${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com
          ECR_URI=${REGISTRY}/${ECR_REPOSITORY}
          aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} >/dev/null 2>&1 || aws ecr create-repository --repository-name ${ECR_REPOSITORY}
          aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${REGISTRY}
          docker build -t ${ECR_URI}:${BUILD_NUMBER} .
          docker push ${ECR_URI}:${BUILD_NUMBER}
          echo ${ECR_URI}:${BUILD_NUMBER} > image-uri.txt
        '''
        script { env.IMAGE_URI = readFile('image-uri.txt').trim() }
      }
    }
    stage('Deploy to EKS using Helm') {
      steps {
        sh '''
          aws eks update-kubeconfig --region ${AWS_DEFAULT_REGION} --name ${EKS_CLUSTER}
          helm upgrade --install ${HELM_RELEASE} ./helm/shopsphere --namespace ${K8S_NAMESPACE} --create-namespace             --set image.repository=$(echo ${IMAGE_URI} | cut -d: -f1) --set image.tag=${BUILD_NUMBER}
          kubectl rollout status deployment/${HELM_RELEASE} -n ${K8S_NAMESPACE} --timeout=180s
        '''
      }
    }
  }
  post {
    success { echo 'ShopSphere deployment completed successfully.' }
    failure { echo 'Pipeline failed. Review the stage logs.' }
    always { archiveArtifacts artifacts: 'target/*.jar', fingerprint: true, allowEmptyArchive: true }
  }
}
