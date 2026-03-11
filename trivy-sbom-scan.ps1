podman run --rm `
  -v "${PWD}:/work" `
  -w /work `
  aquasec/trivy:latest `
  fs --scanners vuln,misconfig,secret,license `
  --format cyclonedx `
  --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL `
  --pkg-types library `
  --output /work/deps-$(Get-Date -Format "yyyyMMdd-HHmmss").json `
  .