# ShopSphere – E-commerce DevOps Project

Sample online shopping UI and CI/CD learning project using Java 17, Spring Boot, Maven, Jenkins, SonarQube, Amazon S3, Amazon ECR, Amazon EKS, Helm, Prometheus and Grafana.

## UI features
- Electronics and fashion catalogue
- Product cards, category filters and prices
- Add to cart, remove from cart, quantity and subtotal
- Responsive desktop/mobile layout
- Spring Boot health and Prometheus metrics endpoints

This is a frontend demo. It has no real user login, database, order service or payment processing.

## Run locally
Requirements: Java 17 and Maven 3.9+.
```bash
mvn clean package
java -jar target/shopsphere.jar
```
Open http://localhost:8080.
Health: http://localhost:8080/actuator/health
Metrics: http://localhost:8080/actuator/prometheus

## AWS resources to prepare
1. EKS cluster and worker nodes.
2. ECR repository named `shopsphere`.
3. S3 bucket for Maven artifacts.
4. IAM role for the Jenkins workload/agent with least-privilege permissions for ECR push, S3 PutObject to the artifact prefix, and EKS deployment access.
5. Jenkins agent with Java 17, Maven, AWS CLI v2, Docker (or an approved image builder), kubectl and Helm.
6. Jenkins SonarQube server configuration named `sonarqube` and a configured SonarQube token.

Do not commit AWS keys or SonarQube tokens. Prefer EKS Pod Identity or IRSA for AWS permissions.

## Jenkinsfile settings
Update `AWS_DEFAULT_REGION`, `S3_BUCKET`, `EKS_CLUSTER`, and `ECR_REPOSITORY` in Jenkinsfile. The pipeline expects an agent that has all required tools and access to a Docker daemon. A Jenkins controller pod does not automatically include these tools. Configure a dedicated Kubernetes agent pod/template. For production, prefer rootless BuildKit or another approved builder over mounting the host Docker socket.

Pipeline stages:
1. Git checkout
2. Maven build and tests
3. SonarQube analysis
4. Upload JAR to S3
5. Build and push Docker image to ECR
6. Deploy to EKS using Helm

Add a SonarQube Quality Gate check before deployment for a stronger production pipeline.

## Manual Helm deployment
```bash
aws eks update-kubeconfig --region ap-south-1 --name YOUR_EKS_CLUSTER
helm upgrade --install shopsphere ./helm/shopsphere --namespace shopsphere --create-namespace   --set image.repository=YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/shopsphere   --set image.tag=YOUR_IMAGE_TAG
kubectl get pods,svc -n shopsphere
```
The demo uses a LoadBalancer Service for simple access. For production, use AWS Load Balancer Controller with Ingress.

## Install Prometheus and Grafana
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```
Open http://localhost:3000. Retrieve the initial Grafana password from the chart-created Kubernetes Secret. Do not commit it.

The app exposes `/actuator/prometheus`. The included ServiceMonitor is labelled for a Prometheus Helm release named `prometheus`; verify the Prometheus Operator discovers it.

## Recommended implementation order
1. Create GitHub repository and push source.
2. Run locally and check the UI.
3. Create ECR and S3.
4. Create EKS and deploy once manually with Helm.
5. Install Jenkins and SonarQube in a separate `tools` namespace.
6. Configure Jenkins agent, IAM access and SonarQube connection.
7. Run Jenkins pipeline.
8. Install Prometheus/Grafana and verify metrics.
