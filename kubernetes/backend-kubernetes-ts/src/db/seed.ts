// src/db/seed.ts
import { Pool } from 'pg';
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
      { name: 'security' }
    ];
    
    console.log('Seeding categories...');
    const categoryValues = categories.map(c => [c.name]);
    const categoryInsertQuery = format(
      'INSERT INTO categories (name) VALUES %L ON CONFLICT (name) DO NOTHING RETURNING id, name',
      categoryValues
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
        categories.map(c => c.name)
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
      { name: 'gitops' },
      { name: 'kubernetes' },
      { name: 'flux' },
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
      { name: 'dependencies' }
    ];
    
    console.log('Seeding tags...');
    const tagValues = tags.map(t => [t.name]);
    const tagInsertQuery = format(
      'INSERT INTO tags (name) VALUES %L ON CONFLICT (name) DO NOTHING RETURNING id, name',
      tagValues
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
      const existingTagsResult = await client.query(existingTagsQuery, [
        tags.map(t => t.name)
      ]);
      
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
        excerpt: 'Learn how to leverage TypeScript generics to write more flexible and reusable code.',
        content: 'TypeScript generics allow you to write flexible, reusable functions and classes that work with a variety of types rather than a single one.\n\nGenerics provide a way to make components work with any data type and not restrict to one data type. This allows users to consume these components and use their own types.\n\n## Basic Generic Syntax\n\nHere\'s a simple example of a generic function that can work with any type:\n\n```typescript\nfunction identity<T>(arg: T): T {\n    return arg;\n}\n\n// Usage\nlet output1 = identity<string>("myString");  // type of output will be string\nlet output2 = identity<number>(123);        // type of output will be number\n```\n\n## Constraints in Generics\n\nYou can also create constraints on your generics to ensure that the type parameter adheres to a specific interface or type:\n\n```typescript\ninterface Lengthwise {\n    length: number;\n}\n\nfunction loggingIdentity<T extends Lengthwise>(arg: T): T {\n    console.log(arg.length);  // Now we know it has a .length property\n    return arg;\n}\n```\n\nThis article just scratches the surface of TypeScript generics. In practice, they can be used to create very powerful abstractions, especially when combined with other TypeScript features.',
        category_name: 'programming',
        tags: ['typescript', 'programming', 'web development']
      },
      {
        slug: 'rust-vs-go-systems-programming',
        title: 'Rust vs Go: Systems Programming in 2025',
        author: 'Michael Rust',
        date: '2025-04-08T14:15:00Z',
        excerpt: 'A detailed comparison between Rust and Go for modern systems programming.',
        content: 'In 2025, both Rust and Go continue to be popular choices for systems programming, with each language offering distinct advantages.\n\n## Performance\n\nRust generally offers better raw performance due to its zero-cost abstractions and lack of garbage collection. It provides more fine-grained control over memory management through its ownership system.\n\nGo, with its garbage collector, might introduce small pauses but provides simpler memory management that\'s often good enough for many use cases.\n\n## Development Speed\n\nGo shines when it comes to development speed. Its simplicity, fast compilation, and straightforward concurrency model with goroutines make it easy to write and maintain code quickly.\n\nRust has a steeper learning curve due to its ownership system but rewards developers with memory safety without garbage collection.\n\n## Use Cases in 2025\n\n### Rust Excels In:\n- Performance-critical applications\n- Systems with strict memory and CPU constraints\n- Embedded systems\n- WebAssembly applications\n- Applications where memory safety is critical without GC overhead\n\n### Go Excels In:\n- Networked services and microservices\n- Cloud-native applications\n- DevOps and infrastructure tools\n- Applications requiring rapid development\n- Services that benefit from simple concurrency\n\n## Ecosystem Growth\n\nBoth languages have seen significant ecosystem growth, but Go\'s package management remains more streamlined with its standard module system, while Rust\'s ecosystem has matured considerably with cargo.',
        category_name: 'programming',
        tags: ['rust', 'go', 'systems programming']
      },
      {
        slug: 'functional-programming-javascript',
        title: 'Functional Programming Principles in JavaScript',
        author: 'Elena Functional',
        date: '2025-04-05T09:45:00Z',
        excerpt: 'Discover how to apply functional programming concepts in your everyday JavaScript code.',
        content: 'Functional programming is a declarative paradigm that treats computation as the evaluation of mathematical functions and avoids changing state and mutable data. JavaScript, despite not being a purely functional language, provides many features that support functional programming techniques.\n\n## Core Principles\n\n### Pure Functions\nPure functions always return the same result given the same arguments and have no side effects. They don\'t modify any state outside their scope.\n\n```javascript\n// Pure function example\nfunction add(a, b) {\n  return a + b;\n}\n```\n\n### Immutability\nIn functional programming, data is immutable - once created, it cannot be changed. Instead of modifying existing data, we create new data structures.\n\n```javascript\n// Using immutability with arrays\nconst originalArray = [1, 2, 3];\nconst newArray = [...originalArray, 4]; // Creates a new array instead of modifying the original\n```\n\n### Higher-Order Functions\nIn JavaScript, functions are first-class citizens, which means they can be assigned to variables, passed as arguments, and returned from other functions.\n\n```javascript\n// Higher-order function example\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(num => num * 2);\n```\n\n### Function Composition\nBuilding complex functions by combining simpler ones is a key concept in functional programming.\n\n```javascript\nconst compose = (f, g) => x => f(g(x));\nconst addOne = x => x + 1;\nconst double = x => x * 2;\n\nconst addOneThenDouble = compose(double, addOne);\nconsole.log(addOneThenDouble(5)); // (5 + 1) * 2 = 12\n```\n\nBy embracing these principles, you can write JavaScript code that\'s more predictable, easier to test, and less prone to bugs.',
        category_name: 'programming',
        tags: ['javascript', 'functional programming', 'web development']
      },
      {
        slug: 'kubernetes-security-best-practices',
        title: 'Kubernetes Security Best Practices for 2025',
        author: 'Kara K8s',
        date: '2025-04-09T11:30:00Z',
        excerpt: 'The latest security best practices for securing your Kubernetes clusters.',
        content: 'Kubernetes security continues to evolve rapidly. Here are the key best practices for securing your Kubernetes clusters in 2025:\n\n## 1. Use the Latest Kubernetes Version\n\nKeep your clusters updated with the latest stable Kubernetes version to benefit from security patches and improvements.\n\n## 2. Implement Pod Security Standards\n\nKubernetes Pod Security Standards (PSS) have replaced the older Pod Security Policies. Define appropriate security contexts for your workloads using the Baseline or Restricted profiles.\n\n## 3. Network Policy Enforcement\n\nImplement network policies to control pod-to-pod communication. Follow the principle of least privilege and only allow necessary communication paths.\n\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-all\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress\n  - Egress\n```\n\n## 4. Secure Supply Chain\n\nUse a combination of:\n- Image scanning in CI/CD\n- Cosign for signing container images\n- Admission controllers to verify signatures\n- Software Bill of Materials (SBOM) generation and validation\n\n## 5. Implement Runtime Security\n\nUse runtime security tools that leverage eBPF for low-overhead, fine-grained monitoring of container behavior.\n\n## 6. Secrets Management\n\nNever store secrets in container images or raw YAML files. Use a dedicated secrets management solution like Hashicorp Vault, cloud provider solutions, or the external secrets operator.\n\n## 7. Regular Security Audits and Penetration Testing\n\nPerform regular security audits using tools like Kube-bench that check your cluster against CIS benchmarks, and conduct penetration testing to identify vulnerabilities.',
        category_name: 'security',
        tags: ['kubernetes', 'security', 'container security', 'devsecops']
      }
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
        [post.slug, post.title, post.author, post.excerpt, post.content, categoryId, post.date]
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
          [postId, tagId]
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
  seed(true).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

export default seed;