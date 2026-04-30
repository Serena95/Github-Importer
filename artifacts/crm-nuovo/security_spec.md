# Security Specification: Skyline Social

## Data Invariants
1. A post must belong to a valid user.
2. Only the owner can edit/delete their posts, comments, and profile.
3. Votes can only be cast on active (not expired) polls.
4. A user cannot follow themselves.
5. Comments must be linked to a post.
6. Notifications can only be seen by the recipient.

## Validation Helpers
- `isValidId(id)`: Ensures 128-char limit and alphanumeric.
- `isValidSocialUser(data)`: Enforces schema for profiles.
- `isValidPost(data)`: Enforces schema for posts (type, content limits).
- `isValidComment(data)`: Enforces schema for comments.
- `isValidPoll(data)`: Enforces schema for polls (options count).

## The Dirty Dozen (Test Payloads)
1. **Identity Spoofing**: Creating a post with `userId` of another user.
2. **State Shortcutting**: Updating a post's `likesCount` directly (should be handled via Cloud Function or restricted transaction logic).
3. **Ghost Field Injection**: Adding `isAdmin: true` to a profile update.
4. **Massive ID Poisoning**: Using a 2MB string as a document ID.
5. **Poll Hijacking**: Voting multiple times (if votes are stored as array or handled in rules).
6. **Notification Snooping**: Reading another user's notifications.
7. **Comment Orphanage**: Posting a comment without a valid `postId`.
8. **Follow Loop**: A user following themselves.
9. **Spam Creation**: Posting 100 images in a single post `mediaUrls` array.
10. **Timeline Tampering**: Setting `createdAt` to a future date.
11. **PII Leak**: Reading another user's private settings.
12. **System Field Modification**: Modifying `score` which is system-calculated.

## Production Rules Target
The rules will implement these checks using `request.auth`, `request.resource`, and `resource`.
