# Offline authentication and payment fixtures

The Google-access and product integration suites use only reserved `.test`
identities and disposable in-memory values. The configured Google-owner fixture
is distinct from the legacy setup-token owner fixture so both owner-binding
paths remain independently exercised. Operational owner configuration and
public support/privacy contacts are not test inputs and are unchanged.

`freshTestValue()` creates a new 32-byte random value for each setup token,
wrong-token comparison, provider credential, payment identifier and URL-userinfo
password. No fixture value is loaded from the environment, written to disk or
registered with an external service. Payment configuration retains only the
`test_` mode prefix required by the application; the remaining value is fresh.
The Google provider is an in-memory module stub on `auth.example.test`.

`installOfflineFetch()` replaces fetch before application modules load and never
calls the original implementation. Outside an explicit mock scope every request
fails. Each mock accepts exactly one method/URL match, checks the expected
request headers and body, and returns an in-memory response. Extra requests,
wrong targets and mismatched payloads are recorded and fail the suite even if
application code catches the rejection. Mock permissions are removed in
`finally`; the original fetch is restored only when the suite ends. This is a
fetch-level test guard, not an operating-system network sandbox.

`verify-test-fixtures.cjs` separately checks reserved identities, independent
values, request matching, no native-fetch delegation, extra/missing calls,
caught-error detection and cleanup after success or failure. The existing
suites retain verified/unverified/mismatched Google identities, header spoofing,
owner setup and reassignment rejection, amount tampering, foreign-order denial,
confirmation idempotency, wrong-key replay, refund terminality, expired-order
manual review, and URL-userinfo rejection. Provider auth and idempotency headers
are now checked explicitly. Failure messages omit request URLs and fixture
credential values.

Run `npm test` to include these checks. No production code, authentication
configuration, payment permissions or deployment settings are changed.
