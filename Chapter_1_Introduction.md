# Chapter 1

## Introduction



### 1.1 Problem Statement and Motivation



The landscape of software development has undergone significant transformation in recent years, driven largely by the adoption of cloud-native technologies and DevOps practices. Organizations today face increasing pressure to deliver applications faster while maintaining high quality and operational efficiency. This shift has led to widespread interest in automation throughout the Software Development Lifecycle, where traditional manual processes are being replaced by sophisticated automated pipelines.

Two prominent approaches have emerged as frontrunners in this evolution: serverless computing architectures, exemplified by Azure Functions, and container orchestration platforms like Kubernetes. Each approach promises distinct advantages, yet the choice between them often proves challenging for development teams and organizations planning their cloud strategy.

The serverless paradigm offers the appeal of complete infrastructure abstraction, where developers can focus entirely on business logic without concerning themselves with server management, scaling decisions, or infrastructure maintenance. Azure Functions, as Microsoft's implementation of Function as a Service, represents this philosophy by providing event-driven execution models with automatic scaling and pay-per-use pricing structures.

On the other hand, Kubernetes has gained tremendous traction as the de facto standard for container orchestration. It provides comprehensive control over application deployment, scaling, and management while offering portability across different cloud environments. The platform has matured significantly, with managed services like Azure Kubernetes Service making it more accessible to development teams.

Despite extensive documentation and case studies available for both platforms, a gap exists in practical, side-by-side comparisons that examine real-world implementation scenarios. Most existing research focuses on theoretical benefits or isolated performance metrics rather than comprehensive analysis covering the full spectrum of considerations that influence architectural decisions.

This research addresses this gap by examining both approaches through the lens of a complete software development lifecycle implementation. The investigation encompasses not only technical performance characteristics but also practical considerations such as development complexity, operational overhead, and long-term maintenance requirements.

The motivation for this study stems from observations in the software development community, where teams often struggle with platform selection decisions. While serverless computing has gained significant attention for its simplicity and cost model, questions remain about its suitability for various application types and traffic patterns. Similarly, while Kubernetes offers powerful capabilities, concerns about complexity and operational overhead persist among development teams.



### 1.2 Research Objectives and Questions



The primary objective of this research is to provide a comprehensive comparison between serverless and container-based approaches for Software Development Lifecycle automation, specifically within the Microsoft Azure ecosystem. This comparison aims to offer practical insights that can guide architectural decision-making in real-world scenarios.

The principal research question guiding this investigation is: "How do serverless architectures using Azure Functions compare to container-based solutions using Azure Kubernetes Service in terms of implementation complexity, performance characteristics, operational requirements, and cost efficiency for modern web applications?"

This primary question branches into several secondary research questions that address specific aspects of the comparison:

How does the initial implementation complexity differ between Azure Functions and Azure Kubernetes Service when developing a complete web application with authentication, data persistence, and API endpoints? This question examines the developer experience, setup requirements, and time-to-market considerations.

What are the performance characteristics of each approach under varying load conditions, and how do factors such as cold starts, scaling behavior, and resource utilization impact overall application responsiveness? This investigation focuses on measurable performance metrics that directly affect user experience.

How do the operational requirements compare between the two approaches, considering aspects such as monitoring, troubleshooting, maintenance, and security management? This analysis addresses the long-term operational burden associated with each platform.

What are the cost implications of each approach across different usage patterns, and how do pricing models affect the total cost of ownership for applications with varying traffic characteristics? This examination provides practical guidance for budget planning and cost optimization.

How do the Continuous Integration and Continuous Deployment pipeline implementations differ between the two approaches, and what are the implications for development workflow efficiency? This question addresses the broader SDLC automation aspects.

These research questions collectively aim to provide a holistic understanding of both approaches, enabling informed decision-making based on specific organizational requirements and constraints.



### 1.3 Scope and Limitations



This research focuses specifically on the Microsoft Azure cloud platform, utilizing Azure Functions for the serverless implementation and Azure Kubernetes Service for the container-based approach. While this platform-specific focus may limit the generalizability of findings to other cloud providers, it allows for deeper analysis within a consistent ecosystem and provides practical value for organizations already invested in or considering the Azure platform.

The study implements a representative web application that includes common components found in modern business applications: a React-based frontend with TypeScript, a Node.js backend with Express framework, PostgreSQL database integration, and comprehensive authentication mechanisms. The serverless implementation utilizes Azure AD B2C for identity management, while the Kubernetes version employs Keycloak for a self-hosted authentication solution.

Geographic scope is limited to Azure regions accessible for research purposes, primarily focusing on European data centers. Network latency characteristics and compliance considerations specific to other regions are not extensively covered in this analysis.

The research timeframe encompasses implementation and testing activities conducted over several months, capturing performance data and operational experiences during this period. Long-term trends, seasonal variations, or extended operational patterns are not within the scope of this investigation.

Several technical limitations apply to this study. Performance testing is conducted using synthetic workloads designed to simulate realistic usage patterns, but may not fully represent all possible application behaviors or user interaction models. Testing is performed within the constraints of academic Azure subscriptions, which may impose certain limitations on resource availability and testing duration.

The comparison focuses on technical and operational aspects while acknowledging that organizational factors such as existing team expertise, company policies, and strategic technology directions play crucial roles in platform selection decisions. These contextual factors are discussed but not quantitatively analyzed.

Security analysis is limited to standard implementation practices and does not include comprehensive penetration testing or advanced threat modeling exercises. Compliance considerations for specific industries or regulatory frameworks are mentioned but not exhaustively examined.

Cost analysis is based on standard Azure pricing models available during the research period and may not reflect custom enterprise pricing agreements or special promotional rates that organizations might obtain.



### 1.4 Research Methodology Overview



This research employs a comparative case study approach, implementing functionally equivalent applications using both serverless and container-based architectures. The methodology combines quantitative performance measurement with qualitative analysis of implementation experiences and operational characteristics.

The experimental design follows a controlled comparison strategy where both implementations provide identical functionality through equivalent API endpoints and user interfaces. This approach ensures that performance differences can be attributed to the underlying platform characteristics rather than functional variations.

Implementation activities are conducted iteratively, with each platform developed independently to optimize for its specific strengths and design patterns. The serverless implementation leverages Azure Functions' event-driven model, while the Kubernetes implementation utilizes containerized microservices architecture with appropriate orchestration patterns.

Performance evaluation is conducted using k6, an open-source load testing tool that enables consistent and repeatable testing scenarios across both platforms. Testing scenarios are designed to evaluate various aspects including response time under different load conditions, resource utilization patterns, scaling behavior, and cold start characteristics where applicable.

The testing methodology incorporates progressive load patterns that simulate realistic traffic conditions, ranging from light background usage to burst traffic scenarios. Each test scenario is executed multiple times to ensure statistical significance of results and to account for variability in cloud service performance.

Cost analysis methodology combines actual resource consumption data with current Azure pricing models to provide realistic total cost of ownership calculations. Multiple usage scenarios are modeled to understand how cost characteristics vary with different traffic patterns and application requirements.

Qualitative assessment is based on detailed documentation of the implementation process, including challenges encountered, problem-solving approaches, and lessons learned during development and deployment activities. This experiential knowledge is systematically captured to provide insights into the practical aspects of working with each platform.

Data collection follows established performance testing practices, with careful attention to factors that might influence results such as testing location, time of day, and concurrent activities on the platform. Results are validated through multiple test runs and statistical analysis to ensure reliability.



### 1.5 Thesis Structure



This thesis is organized into eight chapters that collectively provide a comprehensive examination of serverless versus container-based approaches for Software Development Lifecycle automation.

Following this introduction, Chapter 2 presents a thorough literature review and theoretical background, examining existing research in cloud computing paradigms, serverless architectures, and container orchestration. This chapter establishes the theoretical foundation for the comparative analysis and identifies gaps in current knowledge that this research addresses.

Chapter 3 details the research methodology and system design decisions, providing complete transparency about the experimental approach and ensuring reproducibility of results. The methodology chapter explains the rationale behind technology choices, testing strategies, and evaluation criteria used throughout the investigation.

Chapters 4 and 5 present the detailed implementation experiences for serverless and Kubernetes approaches respectively. These chapters provide comprehensive coverage of the development process, architectural decisions, and technical challenges encountered during implementation. The level of detail provided allows readers to understand the practical implications of each approach and potentially replicate similar implementations.

Chapter 6 constitutes the core analytical contribution of this thesis, presenting detailed comparative analysis across all evaluation dimensions. This chapter presents quantitative performance results alongside qualitative insights gained through hands-on implementation experience. The analysis covers implementation complexity, performance characteristics, scalability behavior, cost implications, operational requirements, and CI/CD pipeline considerations.

Chapter 7 synthesizes the findings into actionable insights, discussing the broader implications of the research results and providing guidance for practitioners facing similar architectural decisions. This chapter also acknowledges limitations of the study and places findings within the broader context of cloud computing evolution.

Chapter 8 concludes the thesis with a summary of key contributions, answers to the research questions, and suggestions for future investigation. The conclusion emphasizes practical outcomes and their relevance to current industry challenges.

Supporting materials including detailed code samples, configuration files, test results, and deployment procedures are provided in comprehensive appendices, ensuring that the research can be independently verified and extended by other researchers or practitioners.

