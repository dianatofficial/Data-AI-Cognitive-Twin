import { CurriculumStage } from '../types/simulation';

export const curriculumStages: CurriculumStage[] = [
  {
    id: 'de_ingestion',
    badge: 'DATA ENGINEERING',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    subsystem: 'de',
    title: 'Data Ingestion Engine & CDC Streaming',
    phonetic: '/ˈdeɪ.tə ɪnˈdʒɛs.tʃən/ • Analogy: High-Pressure Fuel Injector',
    analogy: 'High-Pressure Fuel Injector',
    intro: 'The fuel injection intake manifold. Ingests high-velocity real-time event streams from transactional databases, sensors, and message brokers with zero query overhead.',
    mechanics: [
      {
        title: 'Change Data Capture (CDC)',
        desc: 'Reads database Write-Ahead Logs (WAL) in real-time using Debezium without locking tables or degrading OLTP transaction throughput.'
      },
      {
        title: 'Dynamic Backpressure Throttling',
        desc: 'Throttles upstream ingress apertures automatically when downstream consumer buffer watermarks exceed safe thresholds.'
      },
      {
        title: 'Idempotent Partition Hashing',
        desc: 'Guarantees strictly once-and-only-once delivery semantics even in the presence of abrupt network partitions or worker node crashes.'
      }
    ],
    math: 'Throughput = Min(Ingress_Rate, Buffer_Capacity / Latency_Ms)',
    mathExplanation: 'Ingress efficiency is bounded by Little’s Law ($L = \\lambda W$). If consumer acknowledgement latency grows without buffer headroom, memory exhaustion forces unacknowledged event drops.',
    blueprint: {
      language: 'python',
      title: 'Kafka + Debezium CDC Consumer with Backpressure',
      filename: 'cdc_streaming_consumer.py',
      code: `from confluent_kafka import Consumer, KafkaException
import json, time

conf = {
    'bootstrap.servers': 'kafka-cluster.internal:9092',
    'group.id': 'enterprise-ingest-cg',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False,
    'fetch.max.bytes': 10485760,  # 10MB batch headroom
    'max.poll.interval.ms': 300000
}

consumer = Consumer(conf)
consumer.subscribe(['orders.cdc.events'])

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None: continue
        if msg.error(): raise KafkaException(msg.error())

        payload = json.loads(msg.value().decode('utf-8'))
        # Process database WAL change record with exactly-once idempotency
        process_wal_mutation(payload['before'], payload['after'], payload['op'])
        consumer.commit(msg, asynchronous=True)
finally:
    consumer.close()`
    },
    failure: {
      title: 'Backpressure Queue Burst & Poison Pill Hang',
      description: 'A sudden 10x burst in upstream transaction writes floods consumer buffers, exhausting worker heap and dropping uncommitted message offsets.',
      risk: 'CRITICAL'
    },
    sandbox: {
      label: 'Ingress Stream Velocity',
      base: 250,
      unit: 'msg/sec',
      min: 10,
      max: 100,
      defaultVal: 50,
      calc: (val: number) => {
        const rate = Math.round(val * 250);
        const mem = (val * 0.12).toFixed(1);
        const status = val > 80 ? 'CRITICAL BACKPRESSURE' : val > 65 ? 'BUFFER STRAIN' : 'OPTIMAL FLOW';
        return {
          metricA: `${rate.toLocaleString()} msg/sec`,
          metricB: `${mem} MB Buffer Load`,
          status
        };
      }
    },
    checklist: [
      'Enable Write-Ahead-Log (WAL) logical replication with replica identity set to FULL.',
      'Configure Dead-Letter Queues (DLQ) with automated alert routing for malformed payloads.',
      'Enforce partition key hashing on immutable entity UUIDs to prevent cluster data skew.',
      'Implement Prometheus JMX metrics on consumer group lag offsets.'
    ],
    quiz: {
      question: 'Why is log-based CDC fundamentally superior to periodic SQL query polling (e.g. SELECT * WHERE updated_at > t)?',
      options: [
        'Log-based CDC eliminates full table scans, captures DELETE operations, and causes near-zero OLTP database query overhead.',
        'Periodic polling requires zero database permissions and is mathematically faster than reading transaction logs.',
        'Log-based CDC bypasses network transmission protocols entirely.',
        'Periodic SQL queries guarantee sub-millisecond event streaming without indexing.'
      ],
      correctIndex: 0,
      explanation: 'Log-based CDC inspects binary transaction logs directly on disk without executing costly SQL queries or table locks. Crucially, it captures row DELETES, which periodic SELECT queries cannot observe without soft-delete tombstones.'
    },
    camPos: { x: -8, y: 3.5, z: 9 },
    targetPos: { x: -5, y: 0, z: 0 },
    meshName: 'mesh_ingestion',
    specs: {
      latency: '1.2 ms p99',
      availability: '99.999%',
      protocol: 'Kafka / gRPC / TCP',
      memoryProfile: 'Low CPU / High I/O'
    }
  },
  {
    id: 'de_transformation',
    badge: 'DATA ENGINEERING',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    subsystem: 'de',
    title: 'Distributed Cleansing & Transformation Turbine',
    phonetic: '/ˌiː.tiːˈɛl/ • Analogy: Centrifugal Fuel Filter',
    analogy: 'Centrifugal Fuel Filter',
    intro: 'Functions as a centrifugal filtration turbine. Cleans, schema-validates, deduplicates, and enriches raw streaming data across distributed cluster workers.',
    mechanics: [
      {
        title: 'Distributed Partition Processing',
        desc: 'Splits petabyte workloads across worker nodes using Apache Spark or Flink engines for ultra-fast parallel transformations.'
      },
      {
        title: 'Adaptive Query Execution (AQE)',
        desc: 'Dynamically coalesces shuffle partitions and re-plans skew joins at runtime based on stage execution statistics.'
      },
      {
        title: 'Dead-Letter Vault Isolation',
        desc: 'Instantly intercepts malformed schemas, null pointer anomalies, or corrupt records, routing them into isolated quarantine vaults.'
      }
    ],
    math: 'Speedup = 1 / ((1 - p) + (p / N_workers))',
    mathExplanation: 'Amdahl’s Law dictates maximum scaling efficiency: serial execution bottlenecks (e.g., global sorting, non-splittable uncompressed files) constrain overall cluster acceleration regardless of node count.',
    blueprint: {
      language: 'python',
      title: 'PySpark Structured Streaming with Watermarking',
      filename: 'spark_transformation_pipeline.py',
      code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, expr

spark = SparkSession.builder \\
    .appName("CleanseAndTransformStream") \\
    .config("spark.sql.adaptive.enabled", "true") \\
    .config("spark.sql.adaptive.skewJoin.enabled", "true") \\
    .getOrCreate()

# Stream ingestion with 10-minute late data watermarking
streaming_df = spark.readStream \\
    .format("kafka") \\
    .option("subscribe", "raw_events") \\
    .load() \\
    .selectExpr("CAST(value AS STRING) as json_payload", "timestamp") \\
    .withWatermark("timestamp", "10 minutes")

# Schema enforcement and deduplication
clean_df = streaming_df \\
    .select(from_json(col("json_payload"), schema).alias("data"), "timestamp") \\
    .filter(col("data.customer_id").isNotNull()) \\
    .dropDuplicates(["data.transaction_id", "timestamp"])`
    },
    failure: {
      title: 'Data Skewness Partition Crash (Spark OOM)',
      description: 'Severe hash key collisions cluster 85% of incoming records onto a single worker node, crashing the Java Virtual Machine with an OutOfMemoryError.',
      risk: 'HIGH RISK'
    },
    sandbox: {
      label: 'Cluster Worker Allocation',
      base: 1.5,
      unit: 'Nodes',
      min: 10,
      max: 100,
      defaultVal: 40,
      calc: (val: number) => {
        const nodes = Math.max(2, Math.round(val * 0.8));
        const shuffleTime = (420 / nodes).toFixed(0);
        return {
          metricA: `${nodes} Compute Nodes`,
          metricB: `${shuffleTime} ms Shuffle Phase`,
          status: nodes < 12 ? 'CLUSTER BOTTLENECK' : 'HIGH EFFICIENCY'
        };
      }
    },
    checklist: [
      'Enable Adaptive Query Execution (spark.sql.adaptive.enabled=true).',
      'Specify explicit watermarking thresholds on streaming state stores to prevent memory leaks.',
      'Salt high-cardinality join keys to prevent skewness hotspots.',
      'Implement structured type schemas rather than permissive runtime inference.'
    ],
    quiz: {
      question: 'What is the primary architectural purpose of a streaming "Watermark" in engines like Spark or Flink?',
      options: [
        'It defines the boundary for how late out-of-order data can arrive before being discarded from state memory.',
        'It digitally watermarks output files with cryptographic copyright stamps.',
        'It forces workers to shut down when network bandwidth drops below threshold.',
        'It converts streaming rows into binary audio files for accessibility.'
      ],
      correctIndex: 0,
      explanation: 'Without a watermark, a streaming engine would need to hold window aggregation state indefinitely in memory in case late events arrive. The watermark specifies an SLA for discarding tardy records, freeing critical RAM.'
    },
    camPos: { x: -5.5, y: 4, z: 7.5 },
    targetPos: { x: -3, y: 0, z: 0 },
    meshName: 'mesh_transformation',
    specs: {
      latency: '150 ms batch / 12 ms stream',
      availability: '99.99%',
      protocol: 'Spark / Flink / Arrow',
      memoryProfile: 'High RAM / Distributed I/O'
    }
  },
  {
    id: 'de_lakehouse',
    badge: 'DATA ENGINEERING',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    subsystem: 'de',
    title: 'Analytical Lakehouse & Parquet Columnar Core',
    phonetic: '/pɑːrˈkeɪ ˈleɪk.haʊs/ • Analogy: Engine Cylinder Block',
    analogy: 'Engine Cylinder Block',
    intro: 'The central engine block. Combines cloud storage scalability with ACID transactional guarantees, zero-copy time-travel queries, and columnar file compression.',
    mechanics: [
      {
        title: 'Parquet Columnar Organization',
        desc: 'Stores tabular data vertically by column with snappy compression, dictionary encoding, and run-length bit packing for 80% storage savings.'
      },
      {
        title: 'ACID Transactional Log Commits',
        desc: 'Implements optimistic concurrency control (OCC) using Delta Lake or Apache Iceberg transaction logs to prevent dirty reads.'
      },
      {
        title: 'Automatic Small-File Compaction',
        desc: 'Automatically merges micro-batch streaming files into optimized 512MB columnar files via background Z-Order bin packing.'
      }
    ],
    math: 'Compression_Ratio = Raw_JSON_Bytes / Parquet_Snappy_Bytes ≈ 4.8x',
    mathExplanation: 'By grouping values of identical data types contiguously, columnar storage maximizes entropy reduction and permits hardware vectorization (SIMD) instruction execution.',
    blueprint: {
      language: 'python',
      title: 'Delta Lake ACID Merge with Z-Order Optimization',
      filename: 'delta_lakehouse_merge.py',
      code: `from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "s3://lakehouse/gold/fact_orders")

# High-performance ACID Upsert (Merge)
delta_table.alias("target").merge(
    source=updates_df.alias("source"),
    condition="target.order_id = source.order_id AND target.date = source.date"
).whenMatchedUpdate(set={
    "order_status": "source.order_status",
    "updated_at": "current_timestamp()"
}).whenNotMatchedInsertAll().execute()

# Vacuum old snapshot parquet files and optimize storage layout
delta_table.optimize().executeZOrderBy("customer_id")
delta_table.vacuum(retentionHours=168)`
    },
    failure: {
      title: 'Small Files Explosion & Metadata Starvation',
      description: 'High-frequency streaming writes create millions of 10KB files, causing cloud object storage metadata requests to throttle query latencies by 2000%.',
      risk: 'HIGH RISK'
    },
    sandbox: {
      label: 'Target Parquet File Size',
      base: 5.12,
      unit: 'MB / Block',
      min: 10,
      max: 100,
      defaultVal: 50,
      calc: (val: number) => {
        const size = Math.round(val * 5.12);
        const status = size < 64 ? 'METADATA OVERHEAD' : size > 800 ? 'PARTITION TOO LARGE' : 'OPTIMAL COLUMNAR SPLIT';
        return {
          metricA: `${size} MB File Size`,
          metricB: `${(1000 / (size + 10)).toFixed(0)} Avg Partitions`,
          status
        };
      }
    },
    checklist: [
      'Partition strictly on low-cardinality keys (e.g. date YYYY-MM-DD); never partition by UUID.',
      'Schedule automated OPTIMIZE and VACUUM jobs to prevent snapshot bloat.',
      'Maintain schema evolution safety guards to prevent unintentional column drops.',
      'Leverage predicate pushdown to eliminate disk scans at the storage layer.'
    ],
    quiz: {
      question: 'Why does Columnar storage (e.g., Parquet/ORC) provide 10x faster analytical aggregation than Row-oriented storage (e.g., CSV/JSON)?',
      options: [
        'Analytical queries only scan the exact columns referenced in the query, skipping irrelevant columns entirely via dictionary pushdown.',
        'Columnar formats encrypt all data in GPU memory.',
        'Row-oriented storage is strictly forbidden in cloud data centers.',
        'Columnar engines delete missing values automatically.'
      ],
      correctIndex: 0,
      explanation: 'Column projection allows the execution engine to read only the specific binary column segments needed (e.g. SELECT SUM(price)) rather than deserializing entire 500-column rows from disk.'
    },
    camPos: { x: -3, y: 2.5, z: 6 },
    targetPos: { x: -1, y: 0, z: 0 },
    meshName: 'mesh_lakehouse',
    specs: {
      latency: 'Sub-second OLAP scan',
      availability: '99.999999999% durability',
      protocol: 'Delta / Iceberg / S3 API',
      memoryProfile: 'Storage Tier Scaled'
    }
  },
  {
    id: 'de_orchestration',
    badge: 'DATA ENGINEERING',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    subsystem: 'de',
    title: 'Workflow Orchestration DAG & Lineage',
    phonetic: '/dɪˈrɛk.tɪd eɪˈsɪk.lɪk ɡræf/ • Analogy: Camshaft Timing Belt',
    analogy: 'Camshaft Timing Belt',
    intro: 'Coordinates asynchronous job dependencies across execution graphs without cycles, managing backfills, exponential backoff retries, and data lineage provenance.',
    mechanics: [
      {
        title: 'Directed Acyclic Graph (DAG)',
        desc: 'Ensures tasks execute strictly based on topological dependency order without hazardous infinite loops or deadlocks.'
      },
      {
        title: 'Automated Circuit Breakers',
        desc: 'Halts downstream execution runs immediately when upstream data quality contract assertions or null ratios fail thresholds.'
      },
      {
        title: 'End-to-End Data Lineage Tracking',
        desc: 'Captures OpenLineage telemetry from origin ingestion hooks through transformation to downstream ML inference models.'
      }
    ],
    math: 'Topological_Sort(Nodes, Edges) \\implies \\forall (u, v) \\in E, \\text{Index}(u) < \\text{Index}(v)',
    mathExplanation: 'DAG schedulers compute dependency matrices using depth-first search (DFS) to establish unambiguous task concurrency stages and fault boundaries.',
    blueprint: {
      language: 'python',
      title: 'Production Airflow / Dagster Orchestration DAG',
      filename: 'enterprise_data_dag.py',
      code: `from airflow.decorators import dag, task
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-platform',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'retry_exponential_backoff': True
}

@dag(schedule='@hourly', start_date=datetime(2026, 1, 1), catchup=False, default_args=default_args)
def enterprise_lakehouse_pipeline():

    @task
    def validate_cdc_health() -> bool:
        # Check source consumer lag
        return True

    @task
    def execute_spark_cleansing(is_healthy: bool):
        if not is_healthy: raise ValueError("CDC lag exceeds SLA")
        # Trigger Spark job
        return "gold_table_ready"

    @task
    def sync_feature_store(upstream_status: str):
        # Push point-in-time features to Feast / Hopsworks
        pass

    sync_feature_store(execute_spark_cleansing(validate_cdc_health()))

pipeline = enterprise_lakehouse_pipeline()`
    },
    failure: {
      title: 'Cascading Upstream Pipeline Lockout',
      description: 'An unhandled upstream schema mutation causes task retries to spin indefinitely, blocking all downstream feature syncs and training pipelines.',
      risk: 'CRITICAL'
    },
    sandbox: {
      label: 'DAG Concurrency Threads',
      base: 0.6,
      unit: 'Active DAGs',
      min: 10,
      max: 100,
      defaultVal: 30,
      calc: (val: number) => {
        const dags = Math.round(val * 0.6);
        return {
          metricA: `${dags} Concurrent DAGs`,
          metricB: `${(dags * 4.2).toFixed(1)}% Worker CPU`,
          status: dags > 45 ? 'THREAD POOL SATURATION' : 'BALANCED LOAD'
        };
      }
    },
    checklist: [
      'Avoid dynamic task generation at parse time to prevent Airflow scheduler latency degradation.',
      'Always configure idempotency keys for task retries.',
      'Expose execution alerts directly into Slack / PagerDuty webhooks.',
      'Integrate Great Expectations or Soda data quality gates between stages.'
    ],
    quiz: {
      question: 'Why must workflow dependency graphs be strictly "Acyclic" (DAGs)?',
      options: [
        'Cycles introduce infinite execution loops where Task A waits for Task B, which in turn is waiting for Task A.',
        'Acyclic graphs use fewer CPU cores than circular graphs.',
        'Acyclic graphs are required by SQL standards.',
        'Cyclic graphs cannot be rendered in modern web browsers.'
      ],
      correctIndex: 0,
      explanation: 'A cycle creates an intractable circular deadlock where dependencies can never resolve, causing the scheduler to stall or execute indefinitely.'
    },
    camPos: { x: -1.5, y: 4.5, z: 5.5 },
    targetPos: { x: -2, y: 1.2, z: 0 },
    meshName: 'mesh_orchestration',
    specs: {
      latency: 'Sub-second scheduler tick',
      availability: '99.95%',
      protocol: 'Airflow / Temporal / Dagster',
      memoryProfile: 'Low RAM / High Concurrency'
    }
  },
  {
    id: 'bridge_featurestore',
    badge: 'CONVERGENT BRIDGE',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    subsystem: 'bridge',
    title: 'Dual-State Feature Store & Data Contracts',
    phonetic: '/ˈfiː.tʃər stɔːr/ • Analogy: Dual Clutch Transmission',
    analogy: 'Dual Clutch Transmission',
    intro: 'The bridge connecting Data and AI. Serves low-latency sub-millisecond cached features for live inference alongside batch historical snapshots for model training.',
    mechanics: [
      {
        title: 'Point-in-Time Joins (Time Travel)',
        desc: 'Prevents destructive temporal data leakage by linking training features strictly as they existed at the exact timestamp of each historical event.'
      },
      {
        title: 'Online vs. Offline Dual Store',
        desc: 'Synchronizes high-throughput analytical lakehouse parquet storage (offline) with Redis/DynamoDB in-memory KV caches (online).'
      },
      {
        title: 'Data Contract Schema Enforcement',
        desc: 'Enforces cryptographically signed schema agreements between Data producers and AI consumers, rejecting drift before model inference.'
      }
    ],
    math: 'D_{KL}(P \\parallel Q) = \\sum_{x \\in X} P(x) \\log\\left(\\frac{P(x)}{Q(x)}\\right)',
    mathExplanation: 'Monitors statistical feature distribution shift using Kullback-Leibler (KL) divergence and Population Stability Index (PSI) to trigger automated retraining triggers.',
    blueprint: {
      language: 'python',
      title: 'Feast Feature Store Definition & Time-Travel Join',
      filename: 'feature_store_contract.py',
      code: `from feast import Entity, Field, FeatureView, FileSource
from feast.types import Float32, Int64
from datetime import timedelta

customer_entity = Entity(name="customer_id", join_keys=["customer_id"])

customer_stats_view = FeatureView(
    name="customer_spending_features",
    entities=[customer_entity],
    ttl=timedelta(days=90),
    schema=[
        Field(name="avg_30d_transaction_val", dtype=Float32),
        Field(name="total_orders_count", dtype=Int64),
        Field(name="fraud_risk_score", dtype=Float32),
    ],
    online=True, # Redis / DynamoDB for <5ms inference
    source=FileSource(path="s3://lakehouse/gold/features.parquet", timestamp_field="event_timestamp")
)

# Fetch point-in-time accurate historical training set (Prevents Temporal Leakage)
historical_features = store.get_historical_features(
    entity_df=training_events_df, # Contains [customer_id, event_timestamp]
    features=["customer_spending_features:avg_30d_transaction_val", "customer_spending_features:fraud_risk_score"]
).to_df()`
    },
    failure: {
      title: 'Temporal Data Leakage (Target Leakage)',
      description: 'Historical joins executed without temporal boundaries bleed future post-event indicators into training sets, creating artificial 99.9% test accuracy but complete failure in production.',
      risk: 'SILENT DEGRADATION'
    },
    sandbox: {
      label: 'Online Serving Latency SLA',
      base: 0.08,
      unit: 'ms SLA',
      min: 10,
      max: 100,
      defaultVal: 50,
      calc: (val: number) => {
        const lat = (val * 0.08).toFixed(1);
        const tps = Math.round(12000 / (parseFloat(lat) + 0.1));
        return {
          metricA: `${lat} ms Read Latency`,
          metricB: `${tps.toLocaleString()} QPS Throughput`,
          status: parseFloat(lat) > 5 ? 'SLA VIOLATION' : 'SUB-5MS SERVING'
        };
      }
    },
    checklist: [
      'Enforce explicit entity join keys and event timestamp watermarking.',
      'Synchronize offline parquet extracts and online Redis caches within <30 seconds.',
      'Configure Population Stability Index (PSI > 0.2) alert thresholds for feature drift.',
      'Version feature view code within Git with automated CI/CD validation.'
    ],
    quiz: {
      question: 'What happens if you train an AI fraud model WITHOUT point-in-time feature store joins?',
      options: [
        'The model learns from future fraud indicators that do not exist at the moment of the transaction, resulting in silent production failure.',
        'The model training script will crash with a syntax error.',
        'The model becomes 100% immune to adversarial attacks.',
        'Feature values are automatically converted to random noise.'
      ],
      correctIndex: 0,
      explanation: 'Temporal data leakage occurs when future context (e.g. "account_was_blocked_3_days_later") leaks into the historical training snapshot. In live production, that future signal is nonexistent, rendering the model useless.'
    },
    camPos: { x: 0, y: 5.5, z: 7 },
    targetPos: { x: 0, y: 0, z: 0 },
    meshName: 'mesh_featurestore',
    specs: {
      latency: '1.8 ms online / petabyte offline',
      availability: '99.99%',
      protocol: 'Feast / Hopsworks / Redis',
      memoryProfile: 'In-Memory Key-Value'
    }
  },
  {
    id: 'aie_embeddings',
    badge: 'AI ENGINEERING',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    subsystem: 'aie',
    title: 'Semantic Chunking & Vector Embedding Prism',
    phonetic: '/ˈvɛk.tər ɪmˈbɛd.ɪŋ/ • Analogy: Optical Prism Spectrometer',
    analogy: 'Optical Prism Spectrometer',
    intro: 'Converts unstructured documents, code, and text into dense high-dimensional vectors that capture nuanced semantic concepts across multi-dimensional topological manifolds.',
    mechanics: [
      {
        title: 'Recursive Semantic Chunking',
        desc: 'Splits raw textual documents into context-coherent chunks along syntactic markdown and paragraph boundaries rather than arbitrary token cuts.'
      },
      {
        title: 'High-Dimensional Manifold Mapping',
        desc: 'Projects semantic representations into 1536-dimensional continuous geometric vector spaces where conceptual proximity correlates with mathematical distance.'
      },
      {
        title: 'Cosine Similarity Geometry',
        desc: 'Measures angle-based angular displacement between normalized vectors to rank contextual alignment independent of document length.'
      }
    ],
    math: '\\text{Cosine}(A, B) = \\frac{A \\cdot B}{\\|A\\| \\|B\\|} = \\frac{\\sum_{i=1}^d A_i B_i}{\\sqrt{\\sum A_i^2} \\sqrt{\\sum B_i^2}}',
    mathExplanation: 'Because embedding models output unit-normalized vectors ($\\|A\\| = 1$), cosine similarity simplifies directly to the inner dot product $A \\cdot B$, executed via SIMD matrix multiplication.',
    blueprint: {
      language: 'python',
      title: 'Context-Aware Embedding Generation & Normalization',
      filename: 'semantic_embedder.py',
      code: `import numpy as np
from sentence_transformers import SentenceTransformer

# Load enterprise-grade dense embedding model
model = SentenceTransformer('BAAI/bge-large-en-v1.5')

def generate_normalized_embeddings(chunks: list[str]) -> np.ndarray:
    # Add instructional prefix for asymmetric retrieval
    prefixed_chunks = [f"Represent this document for retrieval: {c}" for c in chunks]
    
    # Compute dense embeddings with batching on GPU
    raw_embeddings = model.encode(
        prefixed_chunks, 
        batch_size=64, 
        show_progress_bar=False, 
        normalize_embeddings=True # Crucial: ensures ||v|| = 1.0
    )
    return raw_embeddings

# Test semantic dot product
vecs = generate_normalized_embeddings(["Data pipeline CDC stream", "Kafka message broker"])
similarity = np.dot(vecs[0], vecs[1])
print(f"Cosine Similarity: {similarity:.4f}")`
    },
    failure: {
      title: 'Semantic Embedding Drift & Chunk Severing',
      description: 'Arbitrary fixed-length token chunking cuts critical clauses in half, producing ungrounded vectors that return hallucinations during search.',
      risk: 'HIGH RISK'
    },
    sandbox: {
      label: 'Embedding Dimensionality (d)',
      base: 15.36,
      unit: 'Dimensions',
      min: 10,
      max: 100,
      defaultVal: 50,
      calc: (val: number) => {
        const dims = Math.round(val * 15.36);
        const vram = (dims * 0.004).toFixed(2);
        return {
          metricA: `${dims} Dimensions`,
          metricB: `${vram} MB / 10k Chunks`,
          status: dims < 384 ? 'REDUCED ACCURACY' : 'HIGH FIDELITY DENSE SPACE'
        };
      }
    },
    checklist: [
      'Use recursive character chunkers with 10% overlap to preserve cross-chunk context.',
      'Always normalize vectors to unit length ($\\|v\\|=1$) to allow dot-product index acceleration.',
      'Append domain-specific instruction prefixes (e.g. for asymmetric query-document retrieval).',
      'Benchmark embedding retrieval accuracy using Mean Reciprocal Rank (MRR@10).'
    ],
    quiz: {
      question: 'Why is L2 vector normalization (unit length) standard practice for vector databases?',
      options: [
        'It allows expensive Cosine Distance calculations to be simplified into fast dot products ($A \\cdot B$).',
        'It shrinks the text file size on user laptops.',
        'It removes foreign characters from prompts.',
        'It prevents the AI model from asking follow-up questions.'
      ],
      correctIndex: 0,
      explanation: 'When both vectors have magnitude 1, the denominator $\\|A\\| \\|B\\|$ equals 1. Therefore, cosine similarity is simply the dot product, which GPUs can compute orders of magnitude faster.'
    },
    camPos: { x: 2, y: 3.5, z: 6 },
    targetPos: { x: 1, y: 0, z: 0 },
    meshName: 'mesh_embeddings',
    specs: {
      latency: '22 ms / 100 chunks',
      availability: '99.99%',
      protocol: 'PyTorch / ONNX Runtime',
      memoryProfile: 'GPU VRAM Bound'
    }
  },
  {
    id: 'aie_retrieval',
    badge: 'AI ENGINEERING',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    subsystem: 'aie',
    title: 'HNSW Vector Indexing & Hybrid Reranking',
    phonetic: '/riːˈræŋ.kər/ • Analogy: High-Speed Optical Sorter',
    analogy: 'High-Speed Optical Sorter',
    intro: 'Executes logarithmic approximate nearest-neighbor search across millions of vectors combined with cross-encoder reranking for maximum precision.',
    mechanics: [
      {
        title: 'Hierarchical Navigable Small World (HNSW)',
        desc: 'Traverses multi-layer geometric graphs for logarithmic $O(\\log N)$ nearest neighbor vector retrieval across millions of dense vectors.'
      },
      {
        title: 'Reciprocal Rank Fusion (RRF)',
        desc: 'Merges dense semantic vector results with sparse lexical keyword scores (BM25) to eliminate domain-specific search blindspots.'
      },
      {
        title: 'Cross-Encoder Deep Reranking',
        desc: 'Performs full cross-attention over top-K candidates to evaluate token-level semantic relevance before feeding context to the LLM.'
      }
    ],
    math: '\\text{RRF\\_Score}(d) = \\sum_{m \\in M} \\frac{1}{60 + r_m(d)}',
    mathExplanation: 'Reciprocal Rank Fusion provides scale-invariant scoring by penalizing rank position without requiring delicate calibration of raw probability distributions.',
    blueprint: {
      language: 'python',
      title: 'Hybrid HNSW Retrieval with Cross-Encoder Reranker',
      filename: 'hybrid_retriever.py',
      code: `import qdrant_client
from sentence_transformers import CrossEncoder

client = qdrant_client.QdrantClient(host="vector-db.internal", port=6333)
reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def hybrid_retrieval(query: str, query_vector: list[float], top_k=25) -> list[dict]:
    # 1. HNSW Approximate Nearest Neighbor Search
    vector_hits = client.search(
        collection_name="enterprise_knowledge",
        query_vector=query_vector,
        limit=top_k,
        search_params={"hnsw_ef": 128} # Higher ef = higher recall
    )
    
    # 2. Extract candidate texts for cross-encoder reranking
    candidate_pairs = [[query, hit.payload['text']] for hit in vector_hits]
    rerank_scores = reranker.predict(candidate_pairs)
    
    # 3. Sort by reranker relevance score
    ranked_results = sorted(
        zip(vector_hits, rerank_scores), 
        key=lambda x: x[1], 
        reverse=True
    )
    return [hit.payload for hit, score in ranked_results[:5]]`
    },
    failure: {
      title: 'Vector Staleness & Recall Collapse',
      description: 'Primary database updates fail to propagate to vector indexes, serving stale 3-month-old documentation that causes AI agents to make invalid assumptions.',
      risk: 'HIGH RISK'
    },
    sandbox: {
      label: 'HNSW Search Depth (efSearch)',
      base: 1.2,
      unit: 'Search Candidates',
      min: 10,
      max: 100,
      defaultVal: 50,
      calc: (val: number) => {
        const ef = Math.round(val * 1.2);
        const recall = (92 + Math.min(7.9, (ef / 120) * 8)).toFixed(1);
        return {
          metricA: `${ef} ef Candidates`,
          metricB: `${recall}% Recall@10`,
          status: ef < 25 ? 'RECALL DEGRADATION' : 'HIGH PRECISION RETRIEVAL'
        };
      }
    },
    checklist: [
      'Tune HNSW M (16-64) and efConstruction (100-200) based on dataset scale and RAM budgets.',
      'Combine BM25 sparse keyword index with dense vectors for exact part number and UUID queries.',
      'Apply Cross-Encoder reranking on top 20 candidates before prompt assembly.',
      'Implement metadata payload filtering prior to graph traversal.'
    ],
    quiz: {
      question: 'Why is pure semantic vector search alone often insufficient for technical enterprise documentation?',
      options: [
        'Vector models struggle with exact part numbers, error codes, and UUIDs that are better found with lexical BM25 search.',
        'Vectors can only store English words.',
        'Vector databases crash when query length exceeds 10 words.',
        'HNSW graphs are fundamentally incapable of reading PDF files.'
      ],
      correctIndex: 0,
      explanation: 'Dense embeddings map concepts into broad semantic neighborhoods. For exact codes (e.g. "ERR_404_KAFKA_DISCONNECT"), sparse lexical search (BM25) provides exact keyword matches that vectors often blur.'
    },
    camPos: { x: 4, y: 3.5, z: 6.5 },
    targetPos: { x: 2.5, y: 0, z: 0 },
    meshName: 'mesh_retrieval',
    specs: {
      latency: '4.5 ms vector / 15 ms rerank',
      availability: '99.99%',
      protocol: 'Qdrant / Milvus / pgvector',
      memoryProfile: 'High RAM Graph Structure'
    }
  },
  {
    id: 'aie_finetuning',
    badge: 'AI ENGINEERING',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    subsystem: 'aie',
    title: 'LoRA Parameter-Efficient Adapter Cards',
    phonetic: '/ˈlɔː.rɑː/ • Analogy: ECU Engine Chip Remapping',
    analogy: 'ECU Engine Chip Remapping',
    intro: 'Adapts massive multi-billion parameter foundation models to custom enterprise domain tasks without retraining or altering billions of frozen base parameters.',
    mechanics: [
      {
        title: 'Frozen Base Parameter Matrices',
        desc: 'Freezes primary multi-head attention weights ($W_0$) in 8-bit/4-bit quantization, slashing training VRAM overhead by 75%.'
      },
      {
        title: 'Low-Rank Matrix Decomposition',
        desc: 'Injects trainable rank decomposition matrices ($A$ and $B$, where $\\Delta W = B \\times A$) with rank $r \\ll d$, capturing updates with tiny memory footprints.'
      },
      {
        title: 'Direct Preference Optimization (DPO)',
        desc: 'Directly optimizes policy parameters over chosen vs. rejected response pairs without requiring unstable auxiliary reward model training.'
      }
    ],
    math: 'W_{\\text{adapted}} = W_0 + \\Delta W = W_0 + \\frac{\\alpha}{r} (B \\times A), \\quad B \\in \\mathbb{R}^{d \\times r}, A \\in \\mathbb{R}^{r \\times k}',
    mathExplanation: 'Because intrinsic task dimensionality is vastly smaller than ambient parameter space, low-rank factorization reduces the parameter count from $d \\times k$ down to $r \\times (d + k)$.',
    blueprint: {
      language: 'python',
      title: 'PEFT LoRA Model Fine-Tuning Setup with PyTorch',
      filename: 'lora_finetune.py',
      code: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, TaskType

base_model_name = "meta-llama/Llama-3-8B-Instruct"

# 1. Load frozen base model in 4-bit precision
model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    load_in_4bit=True,
    device_map="auto"
)

# 2. Configure Low-Rank Adapter (LoRA)
peft_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,               # Low-rank dimension
    lora_alpha=32,      # Scaling factor (alpha / r = 2.0)
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none"
)

model = get_peft_model(model, peft_config)
model.print_trainable_parameters()
# Output: trainable params: 6.8M || all params: 8B || trainable%: 0.08%`
    },
    failure: {
      title: 'Catastrophic Forgetting & Format Hallucination',
      description: 'Over-fitting on narrow domain datasets causes base models to forget core reasoning, logical deductions, or standardized JSON formatting contracts.',
      risk: 'HIGH RISK'
    },
    sandbox: {
      label: 'LoRA Rank Dimension (r)',
      base: 0.64,
      unit: 'Rank (r)',
      min: 10,
      max: 100,
      defaultVal: 50,
      calc: (val: number) => {
        const rank = Math.max(4, Math.round(val * 0.64));
        const params = (rank * 0.42).toFixed(1);
        return {
          metricA: `Rank r = ${rank}`,
          metricB: `${params}M Trainable Weights`,
          status: rank > 48 ? 'HIGH VRAM FOOTPRINT' : 'EFFICIENT ADAPTER'
        };
      }
    },
    checklist: [
      'Apply target modules to both Query/Value (q, v) and Projection (k, o) layers.',
      'Benchmark post-training model on general MMLU reasoning tasks to verify no catastrophic forgetting.',
      'Set LoRA alpha to exactly $2 \\times r$ for mathematical stability.',
      'Export and merge adapters into standalone base models for low-latency inference serving.'
    ],
    quiz: {
      question: 'What is the primary operational advantage of LoRA over full-parameter fine-tuning?',
      options: [
        'It trains less than 1% of total parameters, allowing multiple specialized adapters to share one base model in GPU VRAM.',
        'It makes the model run 10x faster without using any electricity.',
        'It prevents the model from generating punctuation marks.',
        'It converts deep learning weights into standard CSV tables.'
      ],
      correctIndex: 0,
      explanation: 'LoRA trains tiny rank decomposition matrices (often under 50MB) while keeping the massive multi-gigabyte base model frozen, allowing servers to hot-swap different customer adapters dynamically in GPU memory.'
    },
    camPos: { x: 5.5, y: 4, z: 6.5 },
    targetPos: { x: 4, y: 0, z: 0 },
    meshName: 'mesh_finetuning',
    specs: {
      latency: 'Zero inference penalty when merged',
      availability: 'Multi-adapter hot-swap',
      protocol: 'PEFT / HuggingFace / PyTorch',
      memoryProfile: '75% VRAM Reduction'
    }
  },
  {
    id: 'aie_agents',
    badge: 'AI ENGINEERING',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    subsystem: 'aie',
    title: 'Multi-Agent Orchestration & Tool Calling',
    phonetic: '/ˈmʌl.ti ˈeɪ.dʒənt/ • Analogy: Autonomous Flight Control',
    analogy: 'Autonomous Flight Control',
    intro: 'A collaborative network of specialized autonomous AI agents running recursive reasoning loops, delegating subtasks, and invoking real-time APIs and SQL engines.',
    mechanics: [
      {
        title: 'ReAct Loop (Reasoning + Acting)',
        desc: 'Iterates through Thought -> Action -> Observation -> Reflection cycles to solve complex non-deterministic enterprise challenges.'
      },
      {
        title: 'Structured Function Calling',
        desc: 'Enforces strict JSON schema validation on tool parameters, preventing rogue code injection during live database query invocations.'
      },
      {
        title: 'Specialized Agent Role Topology',
        desc: 'Segregates responsibilities across Planner, Coder, SQL Generator, and Verifier agents with strict verification checkpoints.'
      }
    ],
    math: 'S_{t+1} = \\arg\\max_a P(a \\mid S_t, H_t, \\mathcal{T}(S_t)), \\quad H_t = \\{o_1, a_1, \\dots, o_t\\}',
    mathExplanation: 'The agent framework functions as a Partially Observable Markov Decision Process (POMDP) where prompt histories and tool observations guide optimal action policies.',
    blueprint: {
      language: 'python',
      title: 'LangGraph ReAct Multi-Agent Tool Router',
      filename: 'multi_agent_system.py',
      code: `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
import operator

class AgentState(TypedDict):
    messages: Annotated[Sequence[str], operator.add]
    next_action: str
    tool_output: str

# Define Agent Node Execution
def router_agent(state: AgentState):
    latest_query = state['messages'][-1]
    # LLM chooses whether to query SQL DB or call vector search
    if "metrics" in latest_query:
        return {"next_action": "query_sql_tool"}
    return {"next_action": "vector_search_tool"}

workflow = StateGraph(AgentState)
workflow.add_node("router", router_agent)
workflow.add_node("query_sql_tool", execute_safe_sql_query)
workflow.add_node("vector_search_tool", execute_retrieval)

workflow.set_entry_point("router")
workflow.add_conditional_edges("router", lambda s: s["next_action"])
app = workflow.compile()`
    },
    failure: {
      title: 'Infinite Tool Calling Loop & Context Saturation',
      description: 'An ambiguous external API response triggers repeated tool retry loops, burning hundreds of dollars in API tokens and hitting context window limits.',
      risk: 'CRITICAL'
    },
    sandbox: {
      label: 'Max ReAct Loop Iterations',
      base: 0.1,
      unit: 'Max Loops',
      min: 10,
      max: 100,
      defaultVal: 50,
      calc: (val: number) => {
        const loops = Math.max(2, Math.round(val * 0.1));
        const tokenBurn = loops * 1400;
        return {
          metricA: `${loops} Max Iterations`,
          metricB: `${tokenBurn.toLocaleString()} Avg Tokens`,
          status: loops > 7 ? 'RECURSION RISK' : 'STABLE AGENT BOUND'
        };
      }
    },
    checklist: [
      'Set hard execution limits (max_iterations=5, timeout_seconds=30) on all agent loops.',
      'Enforce read-only database connections for SQL-generation tools.',
      'Require human-in-the-loop (HITL) approval for irreversible operations (e.g. DELETE, payments).',
      'Validate LLM tool call outputs using Pydantic or Zod schemas.'
    ],
    quiz: {
      question: 'What is the primary failure mode of unconstrained autonomous Multi-Agent systems?',
      options: [
        'Infinite hallucinated recursion loops that consume token limits without converging on a definitive answer.',
        'Agents physically breaking internet cables.',
        'Agents demanding higher salary compensation.',
        'Agents converting code files into audio recordings.'
      ],
      correctIndex: 0,
      explanation: 'Without strict termination conditions, maximum iteration limits, and clear convergence criteria, autonomous agents can easily bounce ambiguous messages between each other endlessly.'
    },
    camPos: { x: 7, y: 4.5, z: 7.5 },
    targetPos: { x: 5.2, y: 0, z: 0 },
    meshName: 'mesh_agents',
    specs: {
      latency: '1.2s - 4.5s multi-turn',
      availability: '99.9%',
      protocol: 'LangGraph / AutoGen / gRPC',
      memoryProfile: 'Token Context Bound'
    }
  },
  {
    id: 'aie_serving',
    badge: 'AI ENGINEERING',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    subsystem: 'aie',
    title: 'PagedAttention Inference & Safety Guardrails',
    phonetic: '/ˈpædʒd əˈtɛn.ʃən/ • Analogy: Electronic Throttle & Brakes',
    analogy: 'Electronic Throttle & Brakes',
    intro: 'Maximizes inference token generation throughput using virtual memory paging while evaluating output streams in real-time with electronic safety guardrail filters.',
    mechanics: [
      {
        title: 'PagedAttention Virtual KV Cache',
        desc: 'Allocates key-value attention tensors into non-contiguous virtual memory blocks inspired by OS virtual memory, eliminating 96% of VRAM fragmentation.'
      },
      {
        title: 'Speculative Token Decoding',
        desc: 'Employs a lightweight draft model to generate candidate tokens verified in parallel by the primary large model for 2.5x speedups.'
      },
      {
        title: 'Real-Time Streaming Guardrails',
        desc: 'Scans generated token streams on the fly to intercept prompt injections, PII leakage, toxicity, and unauthorized system disclosures.'
      }
    ],
    math: '\\text{KV\\_Memory\\_Saved} = 1 - \\frac{\\text{Paged\\_Physical\\_Blocks}}{\\text{Max\\_Sequence\\_Preallocation}} \\approx 96.3\\%',
    mathExplanation: 'Traditional attention engines pre-allocate contiguous memory for worst-case context lengths. PagedAttention dynamically assigns 16-token physical blocks only as tokens are generated.',
    blueprint: {
      language: 'python',
      title: 'High-Throughput vLLM Serving with Guardrails',
      filename: 'vllm_guardrail_server.py',
      code: `from vllm import LLM, SamplingParams
from guardrails import Guard
from guardrails.hub import DetectPII, ToxicLanguage

# Initialize high-throughput PagedAttention inference engine
llm = LLM(
    model="meta-llama/Meta-Llama-3-70B-Instruct",
    tensor_parallel_size=4, # Distributed over 4 GPUs
    gpu_memory_utilization=0.92,
    max_model_len=8192
)

# Streaming Safety Guardrail
guard = Guard().use_many(DetectPII(on_fail="anonymize"), ToxicLanguage(threshold=0.8, on_fail="exception"))

sampling_params = SamplingParams(temperature=0.7, top_p=0.95, max_tokens=1024)

def secure_inference_stream(prompt: str):
    outputs = llm.generate([prompt], sampling_params)
    raw_response = outputs[0].outputs[0].text
    # Filter through security guardrail
    validated_output = guard.validate(raw_response)
    return validated_output`
    },
    failure: {
      title: 'High Bandwidth Memory (HBM) Starvation & Prompt Injection',
      description: 'Concurrent long-context requests exhaust GPU high-bandwidth memory, triggering Time-To-First-Token (TTFT) latency spikes exceeding 5 seconds.',
      risk: 'HIGH RISK'
    },
    sandbox: {
      label: 'Concurrent Serving Batch Size',
      base: 1.28,
      unit: 'Streams',
      min: 10,
      max: 100,
      defaultVal: 50,
      calc: (val: number) => {
        const streams = Math.round(val * 1.28);
        const ttft = (120 + streams * 2.8).toFixed(0);
        return {
          metricA: `${streams} Active Streams`,
          metricB: `${ttft} ms TTFT Latency`,
          status: streams > 90 ? 'GPU HBM SATURATION' : 'HIGH EFFICIENCY SERVING'
        };
      }
    },
    checklist: [
      'Deploy inference models using vLLM or TensorRT-LLM with PagedAttention enabled.',
      'Tune GPU memory utilization threshold to 0.90 to avoid CUDA out-of-memory crashes.',
      'Implement prompt injection classifiers prior to dispatching prompts to LLM engines.',
      'Configure chunked prefill to balance TTFT with inter-token generation throughput.'
    ],
    quiz: {
      question: 'How does PagedAttention eliminate GPU memory waste in LLM inference servers?',
      options: [
        'By managing Key-Value (KV) activations in virtual non-contiguous memory blocks, avoiding contiguous pre-allocation.',
        'By deleting half of the neural network weights during inference.',
        'By running LLMs exclusively on standard hard drives.',
        'By disabling attention calculations entirely.'
      ],
      correctIndex: 0,
      explanation: 'Similar to virtual memory in operating systems, PagedAttention stores KV cache blocks in non-contiguous physical memory, allowing sequences to share memory and eliminating internal fragmentation waste.'
    },
    camPos: { x: 8.5, y: 3.5, z: 8.5 },
    targetPos: { x: 6, y: 0, z: 0 },
    meshName: 'mesh_serving',
    specs: {
      latency: '18 ms / token (TTFT 120ms)',
      availability: '99.99%',
      protocol: 'vLLM / TensorRT / Triton',
      memoryProfile: 'GPU HBM High Bandwidth'
    }
  }
];
