# Terraform Outputs for InsightFlow-AI-Hub

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.app.public_ip
}

output "instance_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app.public_dns
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.app.id
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${aws_eip.app.public_ip}:3000"
}

output "api_url" {
  description = "URL to access the backend API"
  value       = "http://${aws_eip.app.public_ip}:8000"
}

output "ssh_connection" {
  description = "SSH connection string"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.app.public_ip}"
}
