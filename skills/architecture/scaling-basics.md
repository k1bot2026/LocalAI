# Scaling Basics

Assess and recommend scaling approaches by describing current setup, identifying bottlenecks, suggesting standard scaling strategies, and flagging when expert consultation is needed.

## Prompt Chain

### Step 1: Describe Current Setup
Document the baseline:
- Current deployment architecture (single server, load-balanced, containerized, etc.)
- Current resource usage (CPU, memory, disk, network)
- Current traffic volume and growth trajectory
- Current performance metrics (latency, throughput, availability)
- Current scaling approach (manual, auto-scaling policy)
- Current bottlenecks (what limits throughput)
- Infrastructure provider and service level (cloud, on-premise)

Establish starting point clearly.

### Step 2: Identify Bottlenecks
Find limiting factors:
- Application bottlenecks (inefficient code, algorithms)
- Database bottlenecks (slow queries, locks, connection limits)
- Infrastructure bottlenecks (CPU, memory, bandwidth, disk I/O)
- Network bottlenecks (latency, packet loss)
- Third-party service limits (API rate limits)
- Deployment bottlenecks (slow startup, large images)

For each bottleneck: what prevents scaling through this point.

### Step 3: Recommend Scaling Approaches
Suggest standard strategies:

**Horizontal Scaling** (add more servers):
- Run application in containers on orchestration platform (Kubernetes, Docker Compose)
- Load balance incoming requests across instances
- Make application stateless if possible
- Use message queues for decoupling

**Vertical Scaling** (bigger server):
- When to choose: single large server vs. multiple small
- Hardware limits (can't scale infinitely)
- Cost implications
- Deployment coordination

**Caching** (reduce computation):
- In-memory cache (Redis, Memcached)
- HTTP caching (reverse proxy, CDN)
- Database query caching
- Client-side caching
- Cache invalidation strategy

**Database Optimization**:
- Indexing strategy
- Query optimization
- Connection pooling
- Replication for reads
- Partitioning for writes
- Archiving old data

**Asynchronous Processing**:
- Message queues (RabbitMQ, Kafka, SQS)
- Background jobs (Celery, Bull, etc.)
- Event-driven architecture
- Decoupling request/response

**CDN and Content Delivery**:
- Static asset CDN
- Geographic distribution
- Edge caching

### Step 4: Assess Recommended Approach
For each strategy, evaluate:
- How much does it improve throughput
- Cost to implement
- Complexity introduced
- Team skill requirements
- Monitoring and debugging implications
- Maintenance burden

### Step 5: Create Scaling Roadmap
Prioritize recommendations:
- Short term (quick wins with immediate impact)
- Medium term (larger changes with significant gains)
- Long term (architectural changes for massive scale)

Order by effort vs. impact.

### Step 6: Flag Complex Scaling Scenarios
Identify when to escalate:
- If system needs to scale to millions of users, recommend expert consultation
- If vertical scaling is maxed out and horizontal isn't sufficient
- If data consistency is critical and scaling threatens it
- If real-time guarantees are required
- If solution would require specialized infrastructure

Note: Scaling expertise is domain-specific. Recommend appropriate specialists for complex scenarios.

## Output Format

Present current state and identified bottlenecks clearly. Show recommended scaling approach with effort/impact matrix. Include prioritized roadmap. Flag any scenarios requiring expert consultation with justification.
