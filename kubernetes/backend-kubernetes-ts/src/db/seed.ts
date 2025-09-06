// src/db/seed.ts
import format from 'pg-format';
import pool from '../config/database';

interface Category {
  name: string;
}

interface Tag {
  name: string;
}

interface Post {
  slug: string;
  title: string;
  author: string;
  excerpt: string;
  content: string;
  category_name: string;
  date: string;
  tags: string[];
}

async function seed(endPoolWhenDone: boolean = false): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert categories
    const categories: Category[] = [
      { name: 'programming' },
      { name: 'devops' },
      { name: 'cloud' },
      { name: 'security' },
    ];

    console.log('Seeding categories...');
    const categoryValues = categories.map((c) => [c.name]);
    const categoryInsertQuery = format(
      'INSERT INTO categories (name) VALUES %L ON CONFLICT (name) DO NOTHING RETURNING id, name',
      categoryValues,
    );
    const categoryResult = await client.query(categoryInsertQuery);

    // Create a map of category names to IDs
    const categoryMap = new Map<string, number>();
    for (const row of categoryResult.rows) {
      categoryMap.set(row.name, row.id);
    }

    // For categories that already existed, fetch their IDs
    if (categoryResult.rows.length < categories.length) {
      const existingCategoriesQuery = 'SELECT id, name FROM categories WHERE name = ANY($1)';
      const existingCategoriesResult = await client.query(existingCategoriesQuery, [
        categories.map((c) => c.name),
      ]);

      for (const row of existingCategoriesResult.rows) {
        if (!categoryMap.has(row.name)) {
          categoryMap.set(row.name, row.id);
        }
      }
    }

    // Insert tags
    const tags: Tag[] = [
      { name: 'typescript' },
      { name: 'programming' },
      { name: 'web development' },
      { name: 'rust' },
      { name: 'go' },
      { name: 'systems programming' },
      { name: 'javascript' },
      { name: 'functional programming' },
      { name: 'python' },
      { name: 'devops' },
      { name: 'performance' },
      { name: 'gitops' },
      { name: 'kubernetes' },
      { name: 'azure functions' },
      { name: 'aks' },
      { name: 'serverless' },
      { name: 'ci/cd' },
      { name: 'terraform' },
      { name: 'pulumi' },
      { name: 'iac' },
      { name: 'cloud' },
      { name: 'prometheus' },
      { name: 'grafana' },
      { name: 'monitoring' },
      { name: 'microservices' },
      { name: 'multi-cloud' },
      { name: 'aws' },
      { name: 'azure' },
      { name: 'gcp' },
      { name: 'serverless' },
      { name: 'lambda' },
      { name: 'azure functions' },
      { name: 'scale' },
      { name: 'cost optimization' },
      { name: 'finops' },
      { name: 'cloud economics' },
      { name: 'zero trust' },
      { name: 'security' },
      { name: 'architecture' },
      { name: 'container security' },
      { name: 'devsecops' },
      { name: 'supply chain' },
      { name: 'sbom' },
      { name: 'dependencies' },
      { name: 'oauth' },
      { name: 'authentication' }
    ];

    console.log('Seeding tags...');
    const tagValues = tags.map((t) => [t.name]);
    const tagInsertQuery = format(
      'INSERT INTO tags (name) VALUES %L ON CONFLICT (name) DO NOTHING RETURNING id, name',
      tagValues,
    );
    const tagResult = await client.query(tagInsertQuery);

    // Create a map of tag names to IDs
    const tagMap = new Map<string, number>();
    for (const row of tagResult.rows) {
      tagMap.set(row.name, row.id);
    }

    // For tags that already existed, fetch their IDs
    if (tagResult.rows.length < tags.length) {
      const existingTagsQuery = 'SELECT id, name FROM tags WHERE name = ANY($1)';
      const existingTagsResult = await client.query(existingTagsQuery, [tags.map((t) => t.name)]);

      for (const row of existingTagsResult.rows) {
        if (!tagMap.has(row.name)) {
          tagMap.set(row.name, row.id);
        }
      }
    }

    // Insert posts
    const posts: Post[] = [
      {
        slug: 'understanding-typescript-generics',
        title: 'Understanding TypeScript Generics',
        author: 'Sarah Coder',
        date: '2025-04-10T10:30:00Z',
        excerpt:
          'Learn how to leverage TypeScript generics to write more flexible and reusable code.',
        content:
          'TypeScript generics allow you to write flexible, reusable functions and classes that work with a variety of types rather than a single one.\n\nGenerics provide a way to make components work with any data type and not restrict to one data type. This allows users to consume these components and use their own types.\n\n## Basic Generic Syntax\n\nHere\'s a simple example of a generic function that can work with any type:\n\n```typescript\nfunction identity<T>(arg: T): T {\n    return arg;\n}\n\n// Usage\nlet output1 = identity<string>("myString");  // type of output will be string\nlet output2 = identity<number>(123);        // type of output will be number\n```\n\n## Constraints in Generics\n\nYou can also create constraints on your generics to ensure that the type parameter adheres to a specific interface or type:\n\n```typescript\ninterface Lengthwise {\n    length: number;\n}\n\nfunction loggingIdentity<T extends Lengthwise>(arg: T): T {\n    console.log(arg.length);  // Now we know it has a .length property\n    return arg;\n}\n```\n\nThis article just scratches the surface of TypeScript generics. In practice, they can be used to create very powerful abstractions, especially when combined with other TypeScript features.',
        category_name: 'programming',
        tags: ['typescript', 'programming', 'web development'],
      },
      {
        slug: 'rust-vs-go-systems-programming',
        title: 'Rust vs Go: Systems Programming in 2025',
        author: 'Michael Rust',
        date: '2025-04-08T14:15:00Z',
        excerpt: 'A detailed comparison between Rust and Go for modern systems programming.',
        content:
          "In 2025, both Rust and Go continue to be popular choices for systems programming, with each language offering distinct advantages.\n\n## Performance\n\nRust generally offers better raw performance due to its zero-cost abstractions and lack of garbage collection. It provides more fine-grained control over memory management through its ownership system.\n\nGo, with its garbage collector, might introduce small pauses but provides simpler memory management that's often good enough for many use cases.\n\n## Development Speed\n\nGo shines when it comes to development speed. Its simplicity, fast compilation, and straightforward concurrency model with goroutines make it easy to write and maintain code quickly.\n\nRust has a steeper learning curve due to its ownership system but rewards developers with memory safety without garbage collection.\n\n## Use Cases in 2025\n\n### Rust Excels In:\n- Performance-critical applications\n- Systems with strict memory and CPU constraints\n- Embedded systems\n- WebAssembly applications\n- Applications where memory safety is critical without GC overhead\n\n### Go Excels In:\n- Networked services and microservices\n- Cloud-native applications\n- DevOps and infrastructure tools\n- Applications requiring rapid development\n- Services that benefit from simple concurrency\n\n## Ecosystem Growth\n\nBoth languages have seen significant ecosystem growth, but Go's package management remains more streamlined with its standard module system, while Rust's ecosystem has matured considerably with cargo.",
        category_name: 'programming',
        tags: ['rust', 'go', 'systems programming'],
      },
      {
        slug: 'python-performance-optimization-2025',
        title: 'Python Performance Optimization Techniques for 2025',
        author: 'Alex Pythonic',
        date: '2025-04-06T16:20:00Z',
        excerpt: 'Modern approaches to optimizing Python applications for production workloads.',
        content: 'Python performance optimization has evolved significantly in recent years. Here are the most effective techniques for 2025.\n\n## 1. Leverage PyPy and Alternative Interpreters\n\nPyPy continues to offer significant performance improvements for many Python applications. For CPU-intensive tasks, PyPy can provide 2-10x performance improvements over CPython.\n\n## 2. Use Type Hints with mypy\n\nType hints not only improve code readability and maintainability but also enable better optimization by tools like mypy and IDEs.\n\n```python\nfrom typing import List, Dict, Optional\n\ndef process_data(items: List[Dict[str, int]]) -> Optional[int]:\n    return sum(item.get("value", 0) for item in items)\n```\n\n## 3. Async/Await for I/O Bound Operations\n\nFor applications with heavy I/O operations, asyncio provides excellent performance improvements:\n\n```python\nimport asyncio\nimport aiohttp\n\nasync def fetch_data(session, url):\n    async with session.get(url) as response:\n        return await response.json()\n\nasync def main():\n    async with aiohttp.ClientSession() as session:\n        tasks = [fetch_data(session, url) for url in urls]\n        results = await asyncio.gather(*tasks)\n```\n\n## 4. Cython for Critical Path Optimization\n\nFor performance-critical code sections, Cython can provide near C-speed performance while maintaining Python-like syntax.\n\n## 5. Profiling and Monitoring\n\nUse tools like `cProfile`, `py-spy`, and `line_profiler` to identify bottlenecks before optimizing.',
        category_name: 'programming',
        tags: ['python', 'performance', 'programming']
      },
      {
        slug: 'functional-programming-javascript',
        title: 'Functional Programming Principles in JavaScript',
        author: 'Elena Functional',
        date: '2025-04-05T09:45:00Z',
        excerpt:
          'Discover how to apply functional programming concepts in your everyday JavaScript code.',
        content:
          "Functional programming is a declarative paradigm that treats computation as the evaluation of mathematical functions and avoids changing state and mutable data. JavaScript, despite not being a purely functional language, provides many features that support functional programming techniques.\n\n## Core Principles\n\n### Pure Functions\nPure functions always return the same result given the same arguments and have no side effects. They don't modify any state outside their scope.\n\n```javascript\n// Pure function example\nfunction add(a, b) {\n  return a + b;\n}\n```\n\n### Immutability\nIn functional programming, data is immutable - once created, it cannot be changed. Instead of modifying existing data, we create new data structures.\n\n```javascript\n// Using immutability with arrays\nconst originalArray = [1, 2, 3];\nconst newArray = [...originalArray, 4]; // Creates a new array instead of modifying the original\n```\n\n### Higher-Order Functions\nIn JavaScript, functions are first-class citizens, which means they can be assigned to variables, passed as arguments, and returned from other functions.\n\n```javascript\n// Higher-order function example\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(num => num * 2);\n```\n\n### Function Composition\nBuilding complex functions by combining simpler ones is a key concept in functional programming.\n\n```javascript\nconst compose = (f, g) => x => f(g(x));\nconst addOne = x => x + 1;\nconst double = x => x * 2;\n\nconst addOneThenDouble = compose(double, addOne);\nconsole.log(addOneThenDouble(5)); // (5 + 1) * 2 = 12\n```\n\nBy embracing these principles, you can write JavaScript code that's more predictable, easier to test, and less prone to bugs.",
        category_name: 'programming',
        tags: ['javascript', 'functional programming', 'web development'],
      },
      {
        slug: 'kubernetes-security-best-practices',
        title: 'Kubernetes Security Best Practices for 2025',
        author: 'Kara K8s',
        date: '2025-04-09T11:30:00Z',
        excerpt: 'The latest security best practices for securing your Kubernetes clusters.',
        content:
          'Kubernetes security continues to evolve rapidly. Here are the key best practices for securing your Kubernetes clusters in 2025:\n\n## 1. Use the Latest Kubernetes Version\n\nKeep your clusters updated with the latest stable Kubernetes version to benefit from security patches and improvements.\n\n## 2. Implement Pod Security Standards\n\nKubernetes Pod Security Standards (PSS) have replaced the older Pod Security Policies. Define appropriate security contexts for your workloads using the Baseline or Restricted profiles.\n\n## 3. Network Policy Enforcement\n\nImplement network policies to control pod-to-pod communication. Follow the principle of least privilege and only allow necessary communication paths.\n\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-all\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress\n```\n\n## 4. Secure Supply Chain\n\nUse a combination of:\n- Image scanning in CI/CD\n- Cosign for signing container images\n- Admission controllers to verify signatures\n- Software Bill of Materials (SBOM) generation and validation\n\n## 5. Implement Runtime Security\n\nUse runtime security tools that leverage eBPF for low-overhead, fine-grained monitoring of container behavior.\n\n## 6. Secrets Management\n\nNever store secrets in container images or raw YAML files. Use a dedicated secrets management solution like Hashicorp Vault, cloud provider solutions, or the external secrets operator.\n\n## 7. Regular Security Audits and Penetration Testing\n\nPerform regular security audits using tools like Kube-bench that check your cluster against CIS benchmarks, and conduct penetration testing to identify vulnerabilities.',
        category_name: 'security',
        tags: ['kubernetes', 'security', 'container security', 'devsecops'],
      },
    // DevOps posts (Azure Functions and AKS focused)
      {
        slug: 'azure-functions-serverless-architecture',
        title: 'Building Scalable Applications with Azure Functions',
        author: 'DevOps Dan',
        date: '2025-04-09T13:20:00Z',
        excerpt: 'Design patterns and best practices for serverless applications using Azure Functions.',
        content: 'Azure Functions provides a serverless compute service that enables you to run code on-demand without managing infrastructure. Here\'s how to build scalable applications effectively.\n\n## Function App Architecture\n\nWhen designing Azure Functions applications, consider these architectural patterns:\n\n### 1. Microservices Pattern\nEach function should handle a single responsibility. Break down complex workflows into smaller, focused functions.\n\n### 2. Event-Driven Architecture\nLeverage Azure\'s extensive trigger ecosystem:\n- HTTP triggers for API endpoints\n- Timer triggers for scheduled tasks\n- Queue triggers for asynchronous processing\n- Blob triggers for file processing\n\n## Best Practices\n\n### Cold Start Optimization\n```javascript\n// Minimize cold starts by keeping functions warm\nmodule.exports = async function (context, req) {\n    // Keep initialization outside the handler\n    const dbConnection = getDbConnection();\n    \n    // Your function logic here\n    return {\n        status: 200,\n        body: "Function executed successfully"\n    };\n};\n```\n\n### Environment Configuration\nUse Azure Key Vault for sensitive configuration:\n\n```json\n{\n  "IsEncrypted": false,\n  "Values": {\n    "AzureWebJobsStorage": "UseDevelopmentStorage=true",\n    "FUNCTIONS_WORKER_RUNTIME": "node",\n    "DATABASE_URL": "@Microsoft.KeyVault(SecretUri=https://your-vault.vault.azure.net/secrets/database-url/)",\n    "API_KEY": "@Microsoft.KeyVault(SecretUri=https://your-vault.vault.azure.net/secrets/api-key/)"  \n  }\n}\n```\n\n### Monitoring and Observability\nImplement comprehensive logging with Application Insights:\n\n```javascript\nconst appInsights = require("applicationinsights");\nappInsights.setup().start();\n\nmodule.exports = async function (context, req) {\n    const startTime = Date.now();\n    \n    try {\n        // Your function logic\n        context.log(\'Function executed successfully\');\n        \n        // Custom telemetry\n        appInsights.defaultClient.trackEvent({\n            name: \'FunctionExecution\',\n            properties: {\n                functionName: context.executionContext.functionName,\n                duration: Date.now() - startTime\n            }\n        });\n        \n    } catch (error) {\n        context.log.error(\'Function failed:\', error);\n        appInsights.defaultClient.trackException({exception: error});\n        throw error;\n    }\n};\n```\n\n## Deployment Strategies\n\nUse GitHub Actions for CI/CD:\n\n```yaml\nname: Deploy Azure Functions\non:\n  push:\n    branches: [main]\n    \njobs:\n  build-and-deploy:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v2\n    - uses: azure/functions-action@v1\n      with:\n        app-name: your-function-app\n        package: .\n        publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}\n```',
        category_name: 'devops',
        tags: ['azure functions', 'serverless', 'devops', 'azure']
      },
      {
        slug: 'aks-production-deployment-guide',
        title: 'AKS Production Deployment: A Complete Guide',
        author: 'Kubernetes Kate',
        date: '2025-04-07T11:45:00Z',
        excerpt: 'Step-by-step guide to deploying and managing production workloads on Azure Kubernetes Service.',
        content: 'Azure Kubernetes Service (AKS) provides a managed Kubernetes service that simplifies container orchestration. Here\'s how to deploy production-ready applications.\n\n## Cluster Setup and Configuration\n\n### 1. Cluster Architecture\nFor production workloads, consider these AKS configurations:\n\n```bash\n# Create production-ready AKS cluster\naz aks create \\\n  --resource-group myResourceGroup \\\n  --name myAKSCluster \\\n  --node-count 3 \\\n  --node-vm-size Standard_D4s_v3 \\\n  --enable-cluster-autoscaler \\\n  --min-count 1 \\\n  --max-count 10 \\\n  --enable-addons monitoring \\\n  --enable-managed-identity \\\n  --network-plugin azure \\\n  --service-cidr 10.0.0.0/16 \\\n  --dns-service-ip 10.0.0.10\n```\n\n### 2. Node Pool Configuration\nUse multiple node pools for different workload types:\n\n```bash\n# Add GPU node pool for ML workloads\naz aks nodepool add \\\n  --resource-group myResourceGroup \\\n  --cluster-name myAKSCluster \\\n  --name gpunodepool \\\n  --node-count 2 \\\n  --node-vm-size Standard_NC6s_v3 \\\n  --node-taints sku=gpu:NoSchedule\n```\n\n## Application Deployment\n\n### Deployment Manifest\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: blog-api\n  labels:\n    app: blog-api\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: blog-api\n  template:\n    metadata:\n      labels:\n        app: blog-api\n    spec:\n      containers:\n      - name: blog-api\n        image: myregistry.azurecr.io/blog-api:latest\n        ports:\n        - containerPort: 3001\n        resources:\n          requests:\n            cpu: 250m\n            memory: 256Mi\n          limits:\n            cpu: 500m\n            memory: 512Mi\n        env:\n        - name: NODE_ENV\n          value: "production"\n        - name: DATABASE_URL\n          valueFrom:\n            secretKeyRef:\n              name: app-secrets\n              key: database-url\n        livenessProbe:\n          httpGet:\n            path: /health\n            port: 3001\n          initialDelaySeconds: 30\n          periodSeconds: 10\n        readinessProbe:\n          httpGet:\n            path: /health\n            port: 3001\n          initialDelaySeconds: 5\n          periodSeconds: 5\n```\n\n### Service and Ingress\n```yaml\napiVersion: v1\nkind: Service\nmetadata:\n  name: blog-api-service\nspec:\n  selector:\n    app: blog-api\n  ports:\n  - port: 80\n    targetPort: 3001\n  type: ClusterIP\n---\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: blog-api-ingress\n  annotations:\n    kubernetes.io/ingress.class: azure/application-gateway\n    cert-manager.io/cluster-issuer: "letsencrypt-prod"\nspec:\n  tls:\n  - hosts:\n    - api.myapp.com\n    secretName: api-tls-secret\n  rules:\n  - host: api.myapp.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: blog-api-service\n            port:\n              number: 80\n```\n\n## Security Best Practices\n\n### Network Policies\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: deny-all-default\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress\n```\n\n### Pod Security Standards\n```yaml\napiVersion: v1\nkind: Namespace\nmetadata:\n  name: production\n  labels:\n    pod-security.kubernetes.io/enforce: restricted\n    pod-security.kubernetes.io/audit: restricted\n    pod-security.kubernetes.io/warn: restricted\n```\n\n## Monitoring and Logging\n\nEnable comprehensive monitoring:\n\n```bash\n# Enable Container Insights\naz aks enable-addons \\\n  --resource-group myResourceGroup \\\n  --name myAKSCluster \\\n  --addons monitoring\n```\n\nThis setup provides a robust, production-ready AKS environment with proper security, monitoring, and scaling capabilities.',
        category_name: 'devops',
        tags: ['aks', 'kubernetes', 'azure', 'devops', 'ci/cd']
      },
    // Cloud posts
      {
        slug: 'multi-cloud-architecture-patterns',
        title: 'Multi-Cloud Architecture Patterns for Enterprise Scale',
        author: 'Cloud Architect Chris',
        date: '2025-04-11T15:30:00Z',
        excerpt: 'Design patterns and strategies for building resilient multi-cloud applications.',
        content: 'Multi-cloud strategies are becoming essential for enterprise resilience and avoiding vendor lock-in. Here are proven patterns for success.\n\n## Why Multi-Cloud?\n\n### Business Drivers\n- **Risk Mitigation**: Reduce dependency on single cloud provider\n- **Cost Optimization**: Leverage competitive pricing across providers\n- **Compliance**: Meet regulatory requirements for data residency\n- **Best-of-Breed**: Use specialized services from different providers\n\n## Architecture Patterns\n\n### 1. Active-Passive Multi-Cloud\nPrimary workloads run on one cloud with disaster recovery on another:\n\n```yaml\n# Primary (AWS)\nPrimary Cloud (AWS):\n  - Production workloads\n  - Primary database\n  - Real-time processing\n\nSecondary Cloud (Azure):\n  - Backup and DR\n  - Development/testing\n  - Cold storage\n```\n\n### 2. Active-Active Multi-Cloud\nWorkloads distributed across multiple clouds:\n\n```yaml\n# Multi-region active deployment\nAWS US-East:\n  - API Gateway\n  - Lambda functions\n  - RDS Primary\n\nAzure Europe:\n  - Application Gateway\n  - Functions\n  - SQL Database replica\n\nGCP Asia:\n  - Cloud Load Balancing\n  - Cloud Functions\n  - Cloud SQL\n```\n\n### 3. Federated Multi-Cloud\nDifferent applications on different clouds:\n\n```yaml\nAWS:\n  - Machine Learning (SageMaker)\n  - Analytics (Redshift)\n  - IoT processing\n\nAzure:\n  - Enterprise applications\n  - Identity (Azure AD)\n  - Office 365 integration\n\nGCP:\n  - Big Data (BigQuery)\n  - AI/ML (Vertex AI)\n  - Kubernetes (GKE)\n```\n\n## Implementation Strategies\n\n### Infrastructure as Code\nUse cloud-agnostic tools:\n\n```hcl\n# Terraform multi-cloud example\nprovider "aws" {\n  region = "us-east-1"\n}\n\nprovider "azurerm" {\n  features {}\n}\n\nprovider "google" {\n  project = "my-project"\n  region  = "us-central1"\n}\n\n# Abstract resource definitions\nmodule "compute" {\n  source = "./modules/compute"\n  \n  for_each = {\n    aws   = "aws"\n    azure = "azure"\n    gcp   = "gcp"\n  }\n  \n  cloud_provider = each.key\n  instance_type  = var.instance_types[each.key]\n}\n```\n\n### Container Orchestration\nKubernetes provides cloud abstraction:\n\n```yaml\n# Multi-cloud Kubernetes federation\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: multi-cloud-config\ndata:\n  aws-cluster: "arn:aws:eks:us-east-1:123456789:cluster/my-cluster"\n  azure-cluster: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.ContainerService/managedClusters/my-cluster"\n  gcp-cluster: "projects/my-project/locations/us-central1/clusters/my-cluster"\n```\n\n### Data Synchronization\nImplement cross-cloud data replication:\n\n```python\n# Multi-cloud data sync service\nimport asyncio\nfrom cloud_providers import AWS, Azure, GCP\n\nclass MultiCloudDataSync:\n    def __init__(self):\n        self.aws = AWS()\n        self.azure = Azure()\n        self.gcp = GCP()\n    \n    async def sync_data(self, data, target_clouds):\n        tasks = []\n        \n        if \'aws\' in target_clouds:\n            tasks.append(self.aws.store_data(data))\n        if \'azure\' in target_clouds:\n            tasks.append(self.azure.store_data(data))\n        if \'gcp\' in target_clouds:\n            tasks.append(self.gcp.store_data(data))\n        \n        results = await asyncio.gather(*tasks, return_exceptions=True)\n        return self.handle_sync_results(results)\n```\n\n## Challenges and Solutions\n\n### Network Connectivity\n- Use cloud interconnect services (AWS Direct Connect, Azure ExpressRoute, GCP Cloud Interconnect)\n- Implement VPN mesh networks\n- Consider SD-WAN solutions\n\n### Identity Management\n- Federated identity across clouds\n- SAML/OIDC integration\n- Cross-cloud service account management\n\n### Monitoring and Observability\n- Centralized logging (ELK Stack, Splunk)\n- Multi-cloud monitoring (Datadog, New Relic)\n- Custom dashboards aggregating metrics\n\nMulti-cloud success requires careful planning, robust automation, and consistent governance across all cloud environments.',
        category_name: 'cloud',
        tags: ['multi-cloud', 'architecture', 'aws', 'azure', 'gcp']
      },
    ];

    console.log('Seeding posts...');
    for (const post of posts) {
      // Get category ID
      const categoryId = categoryMap.get(post.category_name);
      if (!categoryId) {
        throw new Error(`Category not found: ${post.category_name}`);
      }

      // Insert post
      const postResult = await client.query(
        `
        INSERT INTO posts (slug, title, author, excerpt, content, category_id, date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            author = EXCLUDED.author,
            excerpt = EXCLUDED.excerpt,
            content = EXCLUDED.content,
            category_id = EXCLUDED.category_id,
            date = EXCLUDED.date,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        `,
        [post.slug, post.title, post.author, post.excerpt, post.content, categoryId, post.date],
      );

      const postId = postResult.rows[0].id;

      // Link post to tags
      // First, delete any existing tag associations
      await client.query('DELETE FROM post_tags WHERE post_id = $1', [postId]);

      // Then insert new tag associations
      for (const tagName of post.tags) {
        const tagId = tagMap.get(tagName);
        if (!tagId) {
          throw new Error(`Tag not found: ${tagName}`);
        }

        await client.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [postId, tagId],
        );
      }
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();

    // Only end the pool if specifically requested
    if (endPoolWhenDone) {
      await pool.end();
    }
  }
}

// Run seed function when this file is executed directly
if (require.main === module) {
  seed(true).catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

export default seed;
