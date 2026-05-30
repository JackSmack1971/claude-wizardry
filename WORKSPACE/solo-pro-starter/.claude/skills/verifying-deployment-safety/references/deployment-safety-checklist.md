# Deployment Safety Checklist

- What scripts or workflows can deploy or upgrade contracts?
- What signer or admin authority do they assume?
- How are environment variables or addresses gated?
- Is there a post-deploy publication or sync step?
- Can the release path drift from committed artifacts or addresses?
- What requires explicit human confirmation?
