# 1. General Guidelines

## 1.1. Write small functions

## 1.2. Prefer stateless functions
Prioritize functions outside components over those inside components that use component state.

## 1.3. Use constants
Use descriptive names for constants. For example, instead of:
```
start = end + 14*3600
```
Use:
```
const SEC_PER_HOUR = 3600;
const WAIT_DURATION_HRS = 14;
end_timestamp_sec = start_timestamp_sec + WAIT_DURATION_HRS * SEC_PER_HOUR;
```

# 2. Writing APIs

## 2.1. Use only HTTP GET and POST methods
Avoid using other methods like DELETE, PATCH, PUT, etc., as they can be confusing and limiting. Use descriptive API names instead of relying on HTTP methods for better readability and flexibility.

Use GET methods only when both conditions are met:
1. The API doesn't require a body
2. The API is purely for reading and doesn't update any resources

## 2.2. Prefer query parameters or HTTP body over Dynamic Segments
While Next.js offers Dynamic Routes, using query parameters allows for a flatter, more readable directory structure.

## 2.3. Organize your APIs
Group APIs related to a resource or feature in a single directory for better organization.

## 2.4. Authentication & Authorization

### 2.4.1. Authentication
Derive IDs/emails from authentication tokens or retrieve them from the database using token-provided IDs. Don't use IDs from body or query params.

### 2.4.2. Authorization
Implement specific authorization requirements for each API.

## 2.5. Returning Errors
Use appropriate error codes based on the situation. Provide simple, helpful messages for debugging.

### 2.5.1. Error codes
| Error Type                                     | Code |
| ---------------------------------------------- | ---- |
| Invalid params (query, body, or path segment)  | 422  |
| Couldn't find or decode user token             | 401  |
| Unauthorized Access                            | 403  |
| Already exists                                 | 409  |
| Unknown                                        | 500  |

### 2.5.2. Avoid sending JSON responses with errors
Prefer simple error messages over JSON responses.

### 2.5.3. Provide informative error messages
Avoid uninformative messages that merely restate the error code.

## 2.6. Database Interactions

### 2.6.1. Never use `SELECT *`
Specify required fields to optimize database performance and prevent accidental exposure of sensitive information.

### 2.6.2. Minimize database requests
Use joins in SQL queries or leverage ORM features to reduce the number of database requests.

### 2.6.3. Use transactions when appropriate
Implement transactions for sets of related database operations to maintain consistency in case of partial failures.

# 3. API Specifications
Document API specifications to facilitate frontend usage.

## 3.1. Define types for request body and response
Use these types when implementing the APIs.

## 3.2. Create wrapper functions for API calls
Implement clean functions that abstract implementation details, exposing only the necessary request and response formats. Ensure these functions are properly typed for clarity.
