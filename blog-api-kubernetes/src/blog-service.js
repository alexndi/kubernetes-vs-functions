// src/blog-service.js
class BlogService {
  constructor() {
    // Mock blog data by category
    this.blogPosts = {
      programming: [
        {
          id: 'prog-1',
          title: 'Understanding TypeScript Generics',
          author: 'Sarah Coder',
          date: '2025-04-10T10:30:00Z',
          excerpt: 'Learn how to leverage TypeScript generics to write more flexible and reusable code.',
          tags: ['typescript', 'programming', 'web development']
        },
        {
          id: 'prog-2',
          title: 'Rust vs Go: Systems Programming in 2025',
          author: 'Michael Rust',
          date: '2025-04-08T14:15:00Z',
          excerpt: 'A detailed comparison between Rust and Go for modern systems programming.',
          tags: ['rust', 'go', 'systems programming']
        },
        {
          id: 'prog-3',
          title: 'Functional Programming Principles in JavaScript',
          author: 'Elena Functional',
          date: '2025-04-05T09:45:00Z',
          excerpt: 'Discover how to apply functional programming concepts in your everyday JavaScript code.',
          tags: ['javascript', 'functional programming', 'web development']
        }
      ],
      devops: [
        {
          id: 'devops-1',
          title: 'GitOps Workflow with Flux v2',
          author: 'David DevOps',
          date: '2025-04-12T11:20:00Z',
          excerpt: 'Implementing continuous delivery with GitOps principles using Flux v2.',
          tags: ['gitops', 'kubernetes', 'flux', 'ci/cd']
        },
        {
          id: 'devops-2',
          title: 'Infrastructure as Code: Terraform vs. Pulumi',
          author: 'Taylor Infrastructure',
          date: '2025-04-07T16:30:00Z',
          excerpt: 'Comparing the two leading IaC tools for managing cloud infrastructure.',
          tags: ['terraform', 'pulumi', 'iac', 'cloud']
        },
        {
          id: 'devops-3',
          title: 'Monitoring Microservices with Prometheus and Grafana',
          author: 'Olivia Observer',
          date: '2025-04-02T13:10:00Z',
          excerpt: 'How to set up comprehensive monitoring for your microservices architecture.',
          tags: ['prometheus', 'grafana', 'monitoring', 'microservices']
        }
      ],
      cloud: [
        {
          id: 'cloud-1',
          title: 'Multi-Cloud Strategies for Enterprise Applications',
          author: 'Cloud Claire',
          date: '2025-04-15T10:00:00Z',
          excerpt: 'How to develop and implement an effective multi-cloud strategy for enterprise workloads.',
          tags: ['multi-cloud', 'aws', 'azure', 'gcp']
        },
        {
          id: 'cloud-2',
          title: 'Serverless at Scale: Lessons Learned',
          author: 'Sam Serverless',
          date: '2025-04-11T15:45:00Z',
          excerpt: 'Real-world experiences scaling serverless architectures for high-traffic applications.',
          tags: ['serverless', 'lambda', 'azure functions', 'scale']
        },
        {
          id: 'cloud-3',
          title: 'Cloud Cost Optimization Techniques',
          author: 'Finance Finn',
          date: '2025-04-03T09:20:00Z',
          excerpt: 'Practical strategies to reduce your cloud bill without sacrificing performance.',
          tags: ['cost optimization', 'finops', 'cloud economics']
        }
      ],
      security: [
        {
          id: 'sec-1',
          title: 'Zero Trust Architecture Implementation Guide',
          author: 'Zach Zero',
          date: '2025-04-14T14:00:00Z',
          excerpt: 'A step-by-step guide to implementing zero trust security in your organization.',
          tags: ['zero trust', 'security', 'architecture']
        },
        {
          id: 'sec-2',
          title: 'Kubernetes Security Best Practices for 2025',
          author: 'Kara K8s',
          date: '2025-04-09T11:30:00Z',
          excerpt: 'The latest security best practices for securing your Kubernetes clusters.',
          tags: ['kubernetes', 'security', 'container security', 'devsecops']
        },
        {
          id: 'sec-3',
          title: 'Supply Chain Security for Modern Applications',
          author: 'Samuel Supply',
          date: '2025-04-04T13:40:00Z',
          excerpt: 'How to secure your software supply chain from development to deployment.',
          tags: ['supply chain', 'security', 'sbom', 'dependencies']
        }
      ]
    };

    // Post content (would be in a DB in a real app)
    this.postContent = {
      'prog-1': 'TypeScript generics allow you to write flexible, reusable functions and classes that work with a variety of types rather than a single one.\n\nGenerics provide a way to make components work with any data type and not restrict to one data type. This allows users to consume these components and use their own types.\n\n## Basic Generic Syntax\n\nHere\'s a simple example of a generic function that can work with any type:\n\n```typescript\nfunction identity<T>(arg: T): T {\n    return arg;\n}\n\n// Usage\nlet output1 = identity<string>("myString");  // type of output will be string\nlet output2 = identity<number>(123);        // type of output will be number\n```\n\n## Constraints in Generics\n\nYou can also create constraints on your generics to ensure that the type parameter adheres to a specific interface or type:\n\n```typescript\ninterface Lengthwise {\n    length: number;\n}\n\nfunction loggingIdentity<T extends Lengthwise>(arg: T): T {\n    console.log(arg.length);  // Now we know it has a .length property\n    return arg;\n}\n```\n\nThis article just scratches the surface of TypeScript generics. In practice, they can be used to create very powerful abstractions, especially when combined with other TypeScript features.',
      'prog-2': 'In 2025, both Rust and Go continue to be popular choices for systems programming, with each language offering distinct advantages.\n\n## Performance\n\nRust generally offers better raw performance due to its zero-cost abstractions and lack of garbage collection. It provides more fine-grained control over memory management through its ownership system.\n\nGo, with its garbage collector, might introduce small pauses but provides simpler memory management that\'s often good enough for many use cases.\n\n## Development Speed\n\nGo shines when it comes to development speed. Its simplicity, fast compilation, and straightforward concurrency model with goroutines make it easy to write and maintain code quickly.\n\nRust has a steeper learning curve due to its ownership system but rewards developers with memory safety without garbage collection.\n\n## Use Cases in 2025\n\n### Rust Excels In:\n- Performance-critical applications\n- Systems with strict memory and CPU constraints\n- Embedded systems\n- WebAssembly applications\n- Applications where memory safety is critical without GC overhead\n\n### Go Excels In:\n- Networked services and microservices\n- Cloud-native applications\n- DevOps and infrastructure tools\n- Applications requiring rapid development\n- Services that benefit from simple concurrency\n\n## Ecosystem Growth\n\nBoth languages have seen significant ecosystem growth, but Go\'s package management remains more streamlined with its standard module system, while Rust\'s ecosystem has matured considerably with cargo.',
      'sec-2': 'Kubernetes security continues to evolve rapidly. Here are the key best practices for securing your Kubernetes clusters in 2025:\n\n## 1. Use the Latest Kubernetes Version\n\nKeep your clusters updated with the latest stable Kubernetes version to benefit from security patches and improvements.\n\n## 2. Implement Pod Security Standards\n\nKubernetes Pod Security Standards (PSS) have replaced the older Pod Security Policies. Define appropriate security contexts for your workloads using the Baseline or Restricted profiles.\n\n## 3. Network Policy Enforcement\n\nImplement network policies to control pod-to-pod communication. Follow the principle of least privilege and only allow necessary communication paths.\n\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-all\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress\n```\n\n## 4. Secure Supply Chain\n\nUse a combination of:\n- Image scanning in CI/CD\n- Cosign for signing container images\n- Admission controllers to verify signatures\n- Software Bill of Materials (SBOM) generation and validation\n\n## 5. Implement Runtime Security\n\nUse runtime security tools that leverage eBPF for low-overhead, fine-grained monitoring of container behavior.\n\n## 6. Secrets Management\n\nNever store secrets in container images or raw YAML files. Use a dedicated secrets management solution like Hashicorp Vault, cloud provider solutions, or the external secrets operator.\n\n## 7. Regular Security Audits and Penetration Testing\n\nPerform regular security audits using tools like Kube-bench that check your cluster against CIS benchmarks, and conduct penetration testing to identify vulnerabilities.'
    };
  }

  async getAllCategories() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return Object.keys(this.blogPosts);
  }

  async getPostsByCategory(category) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const normalizedCategory = category.toLowerCase();
    
    if (this.blogPosts[normalizedCategory]) {
      return {
        category: normalizedCategory,
        posts: this.blogPosts[normalizedCategory],
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        error: 'Category not found',
        availableCategories: Object.keys(this.blogPosts)
      };
    }
  }

  async getPostById(postId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Find the post in any category
    for (const category of Object.keys(this.blogPosts)) {
      const post = this.blogPosts[category].find(p => p.id === postId);
      if (post) {
        // Return post with content
        return {
          ...post,
          content: this.postContent[postId] || 'Content not available',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return { 
      error: 'Post not found',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = BlogService;