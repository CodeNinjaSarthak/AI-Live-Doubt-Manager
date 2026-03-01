# Prometheus Metrics

> Purpose: All Prometheus metrics exported by the system — name, type, labels, and example PromQL queries.

<!-- Populate from: backend/app/core/metrics.py -->
<!-- This is the SINGLE source of truth for metric definitions. -->

## Exposition

Metrics are exposed at: `GET /metrics` (Prometheus text format)

## Metrics Reference

### 1. `http_requests_total`
- **Type:** Counter
- **Labels:** `method`, `path`, `status_code`
- **Description:** Total HTTP requests handled by the FastAPI backend
- **PromQL:** `rate(http_requests_total[5m])`

---

### 2. `http_request_duration_seconds`
- **Type:** Histogram
- **Labels:** `method`, `path`
- **Description:** HTTP request latency in seconds
- **PromQL:** `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`

---

### 3. <!-- metric name -->
- **Type:** <!-- Counter | Gauge | Histogram | Summary -->
- **Labels:** <!-- label names -->
- **Description:** <!-- what does it measure -->
- **PromQL:** <!-- example query -->

---

### 4. <!-- metric name -->
<!-- Repeat for all 6 metrics -->

---

### 5. <!-- metric name -->

---

### 6. <!-- metric name -->

---

## Worker Queue Metrics

<!-- Document any queue-depth or worker processing metrics if exported -->

## Alerting Rules

Alerting thresholds that use these metrics are defined in:
[observability/alerting.md](alerting.md)

Do not duplicate metric definitions there.
