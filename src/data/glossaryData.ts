import { GlossaryItem } from '../types/simulation';

export const glossaryItems: GlossaryItem[] = [
  {
    id: 'cdc',
    term: 'Change Data Capture (CDC)',
    category: 'Data Engineering',
    pronunciation: '/ˌsiː.diːˈsiː/',
    definition: 'A design pattern that monitors and captures committed row-level changes (INSERT, UPDATE, DELETE) directly from a database Write-Ahead Log (WAL) and streams them to downstream consumers with sub-second latency.',
    enterpriseContext: 'Eliminates costly periodic polling queries (SELECT * WHERE updated_at > t) and guarantees that even physical row DELETEs are reliably propagated.',
    relatedStageId: 'de_ingestion'
  },
  {
    id: 'parquet',
    term: 'Apache Parquet',
    category: 'Data Engineering',
    pronunciation: '/pɑːrˈkeɪ/',
    definition: 'An open-source, columnar storage file format optimized for fast analytical queries, featuring advanced encoding schemes (dictionary, run-length, bit-packing) and snappy/zstd compression.',
    enterpriseContext: 'Reduces cloud object storage costs by ~80% compared to JSON/CSV and allows analytical engines to read only requested columns, skipping unneeded data via min/max column statistics.',
    relatedStageId: 'de_lakehouse'
  },
  {
    id: 'dag',
    term: 'Directed Acyclic Graph (DAG)',
    category: 'Data Engineering',
    pronunciation: '/dæɡ/',
    definition: 'A finite directed graph with no directed cycles. In workflow orchestration (Airflow, Dagster), nodes represent tasks and edges define execution order and dependencies.',
    enterpriseContext: 'Guarantees deterministic pipeline execution without circular deadlocks, enabling automated backfilling, task retries, and strict lineage tracking.',
    relatedStageId: 'de_orchestration'
  },
  {
    id: 'feature_store',
    term: 'Feature Store (Dual-State)',
    category: 'Infrastructure',
    pronunciation: '/ˈfiː.tʃər stɔːr/',
    definition: 'A centralized repository that stores, curates, and serves curated machine learning features, providing an online low-latency KV store for live inference and an offline columnar store for batch training.',
    enterpriseContext: 'Solves the "training-serving skew" problem and ensures point-in-time correctness to eliminate temporal data leakage.',
    relatedStageId: 'bridge_featurestore'
  },
  {
    id: 'point_in_time',
    term: 'Point-in-Time Join (Time Travel)',
    category: 'Data Engineering',
    pronunciation: '/pɔɪnt ɪn taɪm dʒɔɪn/',
    definition: 'A temporal join operation that joins feature values as they were known at the exact millisecond of an event, strictly preventing future data from bleeding into historical records.',
    enterpriseContext: 'Without point-in-time joins, models suffer from temporal target leakage, yielding deceptively high validation accuracy but total failure in live inference.',
    relatedStageId: 'bridge_featurestore'
  },
  {
    id: 'hnsw',
    term: 'Hierarchical Navigable Small World (HNSW)',
    category: 'Algorithms',
    pronunciation: '/ˌeɪtʃ.ɛn.ɛsˈdʌbəl.juː/',
    definition: 'A multi-layer graph-based algorithm for approximate nearest neighbor (ANN) vector search. Upper layers have long-range links for fast exploration, while lower layers provide fine-grained local search.',
    enterpriseContext: 'Provides logarithmic O(log N) retrieval latencies across tens of millions of high-dimensional vectors with recall rates exceeding 95-99%.',
    relatedStageId: 'aie_retrieval'
  },
  {
    id: 'lora',
    term: 'Low-Rank Adaptation (LoRA)',
    category: 'AI Engineering',
    pronunciation: '/ˈlɔː.rɑː/',
    definition: 'A Parameter-Efficient Fine-Tuning (PEFT) technique that freezes pre-trained model weights and injects trainable rank-decomposition matrices into transformer layers (ΔW = B × A).',
    enterpriseContext: 'Reduces the number of trainable parameters by up to 99% and slashes VRAM requirements by 75%, allowing multiple customized task adapters to share one base model in memory.',
    relatedStageId: 'aie_finetuning'
  },
  {
    id: 'paged_attention',
    term: 'PagedAttention',
    category: 'AI Engineering',
    pronunciation: '/ˈpædʒd əˈtɛn.ʃən/',
    definition: 'An attention algorithm inspired by operating system virtual memory paging that divides the Key-Value (KV) cache into non-contiguous physical memory blocks.',
    enterpriseContext: 'Eliminates up to 96% of GPU memory waste caused by internal/external fragmentation, enabling 2x-4x higher batching throughput in production servers like vLLM.',
    relatedStageId: 'aie_serving'
  },
  {
    id: 'react_loop',
    term: 'ReAct Pattern (Reason + Act)',
    category: 'AI Engineering',
    pronunciation: '/riːˈækt ˈpæt.ərn/',
    definition: 'An agentic framework where an LLM alternates between reasoning traces (Thought) and task-specific actions (e.g., executing code, querying APIs or SQL databases), observing outcomes to form new thoughts.',
    enterpriseContext: 'Enables autonomous agents to verify findings against real external tools instead of hallucinating answers from static training weights.',
    relatedStageId: 'aie_agents'
  },
  {
    id: 'data_contract',
    term: 'Data Contract',
    category: 'Infrastructure',
    pronunciation: '/ˈdeɪ.tə ˈkɒn.trækt/',
    definition: 'A formal agreement between data producers and downstream consumers detailing schema definitions, semantics, quality expectations, and SLA guarantees.',
    enterpriseContext: 'Prevents silent breaking changes where upstream software engineers alter a database column name or type, unintentionally breaking downstream ML features.',
    relatedStageId: 'bridge_featurestore'
  },
  {
    id: 'rrf',
    term: 'Reciprocal Rank Fusion (RRF)',
    category: 'Algorithms',
    pronunciation: '/ˌɑːr.ɑːrˈɛf/',
    definition: 'An algorithm that combines ranked search results from multiple disparate information retrieval systems (e.g. dense vector search and sparse BM25) into a unified scoring list without needing calibrated scores.',
    enterpriseContext: 'Combines the conceptual understanding of vector embeddings with the precision keyword matching of BM25, mitigating the weaknesses of both.',
    relatedStageId: 'aie_retrieval'
  }
];
