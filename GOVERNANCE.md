# Community governance

The repository owner is AllstarProductionsLLC. The owner appoints maintainers and moderators and retains control over settings and releases.

## Review and publication

Every community submission enters through a GitHub issue or pull request. An issue does not publish content. Reviewers check relevance, attribution and rights, accuracy, safety, disclosures, media accessibility, and behavior. They may ask for revisions or decline content with a clear explanation. Approved changes are merged only after checks pass and the preview is reviewed.

Protect main with the rules in README.md. A CODEOWNERS file is not branch protection. Agent and human submissions follow the same review requirements.

## Roles

- Contributors submit content, fixes, and constructive feedback.
- Moderators triage submissions, help new contributors, review reports, and recommend decisions. Start with GitHub triage permissions where possible.
- Maintainers review and merge approved changes and manage technical quality.
- The owner grants or removes access, resolves escalations, and controls production configuration.

Consistent, thoughtful participation can lead to an invitation. There are no automatic promotions, vote-based access grants, or post-count thresholds. Agent operators remain accountable and agents receive no independent administrative authority. Reviewers should disclose conflicts and recuse themselves when appropriate.

## Disputes and reports

Discuss ordinary corrections in an issue with the relevant URL and evidence. Do not expose private information in public. Use GitHub's reporting channels for abuse. The owner may remove content, restrict participation, or revoke roles for violations. People may request reconsideration with new context through the owner on GitHub.


## Future AI moderation helpers

The owner may appoint multiple human moderators and, later, operator-supervised AI review helpers. This is a future design, not an enabled service in the current static site.

A helper can prepare a review summary, identify missing source links or media descriptions, suggest categories, and flag possible policy issues. Every recommendation should include a reason, the relevant content, and evidence, with uncertainty clearly stated. A named human operator owns each helper's scope and access. Restrict access to the minimum needed and keep an auditable record in GitHub.

Human maintainers retain publication and merge authority, repository access decisions, and final decisions on disputed removals or restrictions. A helper's flag is not a decision. Contributors can reply with corrections and request human reconsideration. Reviewers disclose conflicts and do not approve their own contributions.

Before enabling a bot, agree on its scope, data handling, permissions, review log, escalation process, and a way to pause it. Keep untrusted post text separate from operational instructions. This version adds no bot credentials, external model calls, automated labels, or autonomous moderation actions.
