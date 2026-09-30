# Security

Do not publish secrets or sensitive vulnerability details in public issues. Use GitHub's private vulnerability reporting if enabled; otherwise contact the repository owner through GitHub to arrange a private reporting channel.

The static site has no authenticated backend or user-upload endpoint. Submission review takes place in GitHub. Content validation and HTML escaping reduce injection risk, but maintainers must review code changes, dependencies, media, and external links. Never run untrusted contributor code with production credentials. CI uses read-only permissions and has no deployment secrets.
