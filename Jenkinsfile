// InsightFlow-AI-Hub Jenkins Pipeline
// CI/CD Pipeline with Security Scanning and Terraform Deployment
// 
// Pipeline Stages:
// 1. Checkout - Pull code from Git repository
// 2. Infrastructure Security Scan - Trivy scans Terraform for vulnerabilities
// 3. Terraform Plan - Preview infrastructure changes

pipeline {
    agent any
    
    environment {
        // AWS Credentials (configure in Jenkins credentials store)
        AWS_CREDENTIALS = credentials('aws-credentials')
        
        // Terraform working directory
        TF_WORKING_DIR = 'terraform'
        
        // Trivy settings
        TRIVY_SEVERITY = 'CRITICAL,HIGH,MEDIUM'
        TRIVY_EXIT_CODE = '1'  // Fail on issues (set to 0 to continue with warnings)
    }
    
    options {
        // Keep build history
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timestamps in console output
        timestamps()
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
    }
    
    stages {
        // =====================================================================
        // STAGE 1: CHECKOUT
        // Pull source code from Git repository
        // =====================================================================
        stage('Checkout') {
            steps {
                echo '📥 Stage 1: Checking out source code...'
                
                // Clean workspace and checkout
                cleanWs()
                checkout scm
                
                // Display repository info
                sh '''
                    echo "Repository checked out successfully!"
                    echo "Current directory: $(pwd)"
                    echo "Files in workspace:"
                    ls -la
                    echo ""
                    echo "Terraform files:"
                    ls -la terraform/ || echo "No terraform directory found"
                '''
            }
        }
        
        // =====================================================================
        // STAGE 2: INFRASTRUCTURE SECURITY SCAN
        // Use Trivy to scan Terraform files for misconfigurations
        // =====================================================================
        stage('Infrastructure Security Scan') {
            steps {
                echo '🔍 Stage 2: Scanning infrastructure code for security vulnerabilities...'
                
                script {
                    // Run Trivy scan on Terraform files
                    def scanResult = sh(
                        script: '''
                            echo "============================================"
                            echo "🛡️  TRIVY INFRASTRUCTURE SECURITY SCAN"
                            echo "============================================"
                            echo ""
                            echo "Scanning Terraform configurations for:"
                            echo "  - Security misconfigurations"
                            echo "  - Compliance violations"
                            echo "  - Best practice violations"
                            echo ""
                            
                            # Run Trivy config scan on terraform directory
                            docker run --rm \
                                -v $(pwd)/terraform:/terraform \
                                aquasec/trivy:latest config \
                                --severity ${TRIVY_SEVERITY} \
                                --exit-code ${TRIVY_EXIT_CODE} \
                                --format table \
                                /terraform
                            
                            SCAN_EXIT_CODE=$?
                            
                            echo ""
                            echo "============================================"
                            if [ $SCAN_EXIT_CODE -eq 0 ]; then
                                echo "✅ SECURITY SCAN PASSED - No critical issues found"
                            else
                                echo "❌ SECURITY SCAN FAILED - Vulnerabilities detected!"
                                echo ""
                                echo "🤖 AI REMEDIATION REQUIRED"
                                echo "Copy the vulnerability report above and use Gemini 2.5 Flash"
                                echo "to analyze risks and generate security fixes."
                            fi
                            echo "============================================"
                            
                            exit $SCAN_EXIT_CODE
                        ''',
                        returnStatus: true
                    )
                    
                    if (scanResult != 0) {
                        // Mark build as unstable but continue to show report
                        currentBuild.result = 'UNSTABLE'
                        
                        echo """
                        ╔══════════════════════════════════════════════════════════════╗
                        ║         🚨 SECURITY VULNERABILITIES DETECTED 🚨              ║
                        ╠══════════════════════════════════════════════════════════════╣
                        ║                                                              ║
                        ║  The Trivy security scan has detected vulnerabilities in     ║
                        ║  your Terraform infrastructure code.                         ║
                        ║                                                              ║
                        ║  NEXT STEPS:                                                 ║
                        ║  1. Review the vulnerability report above                    ║
                        ║  2. Copy the report to Gemini 2.5 Flash AI                   ║
                        ║  3. Ask AI to analyze risks and suggest fixes                ║
                        ║  4. Apply the recommended changes to terraform/main.tf       ║
                        ║  5. Re-run this pipeline to verify fixes                     ║
                        ║                                                              ║
                        ╚══════════════════════════════════════════════════════════════╝
                        """
                        
                        // Optionally fail the build (uncomment to enforce)
                        // error("Security scan failed! Fix vulnerabilities before proceeding.")
                    }
                }
            }
            post {
                always {
                    echo 'Security scan stage completed.'
                }
                success {
                    echo '✅ Security scan passed!'
                }
                unstable {
                    echo '⚠️ Security scan found issues - review required'
                }
            }
        }
        
        // =====================================================================
        // STAGE 3: TERRAFORM PLAN
        // Initialize and plan Terraform infrastructure
        // =====================================================================
        stage('Terraform Plan') {
            when {
                expression { currentBuild.result != 'FAILURE' }
            }
            steps {
                echo '📋 Stage 3: Running Terraform plan...'
                
                dir("${TF_WORKING_DIR}") {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                      credentialsId: 'aws-credentials',
                                      accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                                      secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        sh '''
                            echo "============================================"
                            echo "🏗️  TERRAFORM INFRASTRUCTURE PLAN"
                            echo "============================================"
                            
                            # Initialize Terraform
                            echo "Initializing Terraform..."
                            terraform init -input=false
                            
                            # Validate configuration
                            echo ""
                            echo "Validating Terraform configuration..."
                            terraform validate
                            
                            # Generate plan
                            echo ""
                            echo "Generating infrastructure plan..."
                            terraform plan -input=false -out=tfplan
                            
                            echo ""
                            echo "============================================"
                            echo "✅ Terraform plan generated successfully!"
                            echo "============================================"
                            echo ""
                            echo "To apply this plan, run: terraform apply tfplan"
                        '''
                    }
                }
            }
        }
    }
    
    // =========================================================================
    // POST-BUILD ACTIONS
    // =========================================================================
    post {
        always {
            echo """
            ╔══════════════════════════════════════════════════════════════╗
            ║              PIPELINE EXECUTION SUMMARY                      ║
            ╠══════════════════════════════════════════════════════════════╣
            ║  Build Number: ${BUILD_NUMBER}
            ║  Build Status: ${currentBuild.result ?: 'SUCCESS'}
            ║  Duration: ${currentBuild.durationString?.replace(' and counting', '') ?: 'N/A'}
            ╚══════════════════════════════════════════════════════════════╝
            """
        }
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        unstable {
            echo '⚠️ Pipeline completed with warnings - review security scan results'
        }
        failure {
            echo '❌ Pipeline failed - check logs for details'
        }
        cleanup {
            // Clean up workspace (optional)
            // cleanWs()
            echo 'Pipeline cleanup completed.'
        }
    }
}
