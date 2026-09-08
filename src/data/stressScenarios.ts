import { StressScenario } from '../types/simulation';

export const stressScenarios: StressScenario[] = [
  {
    id: 'data_skew',
    title: 'Data Skewness Partition Crash',
    subsystem: 'de',
    subsystemLabel: 'Data Engineering',
    riskBadge: 'HIGH RISK',
    riskClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Hash key collisions cluster millions of records onto a single Spark worker node, triggering an Out-Of-Memory (OOM) crash that stalls upstream CDC ingestion.',
    telemetryAlert: 'CRITICAL (Spark JVM OOM Exception / Worker Node Terminated)',
    breakdown: 'A hot partition key (e.g. null values or an ultra-popular enterprise customer ID) caused 85% of incoming row payloads to map onto Worker #4. The executor heap exceeded 32GB, causing GC thrashing and worker failure.',
    remediation: 'Implement Partition Salting: append randomized salt prefixes (0..N) to the skewed join keys before distribution, and execute adaptive skew joins via Spark AQE.',
    codeFix: `# Remediation: Key Salting Pattern
import random
from pyspark.sql.functions import udf, concat, lit

salt_udf = udf(lambda: random.randint(0, 9))
salted_df = raw_df.withColumn("salted_key", concat(col("customer_id"), lit("_"), salt_udf()))
# Join with replicated dimension table to distribute shuffle load uniformly`,
    affectedMesh: 'mesh_transformation'
  },
  {
    id: 'memory_bandwidth',
    title: 'GPU VRAM Bandwidth Throttling',
    subsystem: 'aie',
    subsystemLabel: 'AI Engineering',
    riskBadge: 'HIGH RISK',
    riskClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Autoregressive token generation saturates High Bandwidth Memory (HBM), causing Time-To-First-Token (TTFT) to spike exponentially beyond SLA thresholds.',
    telemetryAlert: 'LATENCY SPIKE (TTFT > 5.4s / HBM Memory Bus at 99.8%)',
    breakdown: 'Un-quantized 16-bit weight matrices combined with unpaged Key-Value attention caches fragmented GPU memory during 100 concurrent 8K-token requests.',
    remediation: 'Deploy PagedAttention memory virtualization via vLLM with 4-bit AWQ weight quantization to eliminate fragmentation and double batch throughput.',
    codeFix: `# Remediation: Deploy vLLM with PagedAttention & AWQ
python -m vllm.entrypoints.openai.api_server \\
    --model meta-llama/Meta-Llama-3-70B-Instruct \\
    --quantization awq \\
    --gpu-memory-utilization 0.92 \\
    --max-model-len 8192 \\
    --tensor-parallel-size 4`,
    affectedMesh: 'mesh_serving'
  },
  {
    id: 'temporal_leakage',
    title: 'Feature Store Temporal Data Leakage',
    subsystem: 'bridge',
    subsystemLabel: 'Convergent Bridge',
    riskBadge: 'SILENT ERROR',
    riskClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Unbounded joins bleed future timestamps into historical training features, producing deceptive 99.9% training accuracy but catastrophic failure in production.',
    telemetryAlert: 'DECEPTIVE EQUILIBRIUM (99.9% Train Acc vs. 38% Live Precision)',
    breakdown: 'A feature pipeline computed 30-day rolling aggregate spending without constraining against the historical order timestamp. Future transactions leaked into past feature snapshots.',
    remediation: 'Enforce point-in-time "As-Of" join semantics within Feast/Hopsworks feature store to bind feature calculation strictly to historical event timestamps.',
    codeFix: `# Remediation: Feast Point-in-Time Accurate Retrieval
training_data = store.get_historical_features(
    entity_df=orders_df[["customer_id", "order_timestamp"]],
    features=["customer_stats:avg_spent_30d", "customer_stats:risk_score"]
).to_df()
# Point-in-time guarantees no feature computed after order_timestamp is returned`,
    affectedMesh: 'mesh_featurestore'
  },
  {
    id: 'dag_deadlock',
    title: 'Cascading DAG Pipeline Deadlock',
    subsystem: 'de',
    subsystemLabel: 'Data Engineering',
    riskBadge: 'HIGH RISK',
    riskClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'A circular dependency in upstream task orchestration blocks downstream Lakehouse updates and feature ingestion runs.',
    telemetryAlert: 'SCHEDULER STALL (Circular Lockout Detected / SLA Miss)',
    breakdown: 'A developer introduced a mutual state dependency where Task A waited on Task B output while Task B waited on Task A completion signal, freezing worker threads.',
    remediation: 'Execute topological DAG sorting with automated linting (DAG integrity tests in CI/CD) and enforce strict unidirectional dependencies.',
    codeFix: `# Remediation: CI/CD DAG Acyclicity Test
from airflow.models import DagBag

def test_no_cycles():
    dag_bag = DagBag(include_examples=False)
    assert len(dag_bag.import_errors) == 0, f"DAG import failures: {dag_bag.import_errors}"
    for dag_id, dag in dag_bag.dags.items():
        assert not dag.has_cycle(), f"Cycle detected in {dag_id}"`,
    affectedMesh: 'mesh_orchestration'
  },
  {
    id: 'agent_loop',
    title: 'Infinite Multi-Agent Tool Recursion',
    subsystem: 'aie',
    subsystemLabel: 'AI Engineering',
    riskBadge: 'CRITICAL',
    riskClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'An ambiguous external API response triggers repeated tool retry loops, burning hundreds of dollars in API tokens and hitting context limits.',
    telemetryAlert: 'RECURSION SPIRAL (Token Burn Rate: $18.40/min / Iteration 14/15)',
    breakdown: 'An agent received a malformed JSON response from an external payment API and attempted self-correction recursively without a convergence exit condition.',
    remediation: 'Configure deterministic recursion bounds (max_iterations=5), exponential backoff circuit breakers, and human-in-the-loop fallback escalation.',
    codeFix: `# Remediation: Hard Bound Recursion & Circuit Breaker
def bounded_agent_step(state: AgentState, config: RunnableConfig):
    iteration_count = state.get("step_count", 0)
    if iteration_count >= 5:
        return {"messages": ["Escalating to human supervisor due to loop limit."]}
    return {"step_count": iteration_count + 1}`,
    affectedMesh: 'mesh_agents'
  }
];
