# Comprehensive Q&A for 5+ Years Full Stack Developer
*Based on Interview Feedback Areas of Improvement*

---

## Part 1: C# & .NET Core Advanced

### Q1: How does Garbage Collection work for unmanaged resources? What are Finalizers?
**Answer:** 
The .NET Garbage Collector (GC) runs on the managed heap to clear C# objects. It has absolutely no knowledge of *unmanaged resources* (like open database connections, open file handles, network sockets, or OS window handles). 
To clean these up safely, we must implement the `IDisposable` interface and write a `Dispose()` method. We then use the `using` block in our C# code to guarantee `Dispose()` is called even if an exception occurs mid-execution.

**Example:**
```csharp
// The using block ensures connection.Dispose() is implicitly called at the closing bracket
using (var connection = new SqlConnection(connString)) {
    connection.Open();
}
```

*   **Pros:** The `using` block ensures deterministic disposal, freeing up OS resources immediately and preventing memory leaks.
*   **Cons of Finalizers:** Relying on Finalizers (`~ClassName()`) severely degrades performance because objects with Finalizers require an extra GC cycle to be cleaned up. The standard pattern is to use both, but suppress the finalizer inside `Dispose()` by calling `GC.SuppressFinalize(this)`.

### Q2: What is the Incremental Build process in .NET?
**Answer:** 
Incremental build is a feature of MSBuild that heavily optimizes compilation time. Before compiling a project, MSBuild compares the timestamps of the input source files against the generated output files (dlls, pdbs). If the outputs are newer than the inputs, MSBuild skips compiling that project entirely.

**Example:** Modifying only a `UserService.cs` file in the `User.API` project out of a 50-project microservice solution. MSBuild only recompiles `User.API` and skips the other 49.

*   **Pros:** Massively speeds up local development and CI/CD pipeline build times.
*   **Cons:** Occasionally, build artifacts can become corrupted or misaligned, requiring a forced manual teardown via `dotnet clean` (Clean and Rebuild).

### Q3: What are the different types of Configuration Providers and what is the IOptions interface?
**Answer:** 
.NET Core configuration is built on key-value pairs read from various providers. The **Options pattern** (`IOptions`) uses classes to provide strongly-typed access to these settings to avoid relying on hardcoded strings. There are three types: `<T>`, `Snapshot<T>`, and `Monitor<T>`.

**Example:**
```csharp
// Injecting real-time configuration into a background service
public EmailService(IOptionsMonitor<EmailSettings> options) {
    _settings = options.CurrentValue;
}
```

*   **Pros:** `IOptionsMonitor` allows hot-reloading configurations in real-time without restarting the running application. It's strongly typed, enabling compile-time checking.
*   **Cons:** Standard `IOptions` is a Singleton and requires a full app restart if settings change. Overusing `IOptionsMonitor` everywhere can add slight memory overhead due to change-listener subscriptions.

### Q4: Explain Covariance and Contravariance in Generics.
**Answer:** 
These concepts deal with type safety and polymorphism in generic interfaces and delegates.
*   **Covariance (`out` keyword):** Used when an interface **produces/returns** data. e.g., `IEnumerable<out T>`.
*   **Contravariance (`in` keyword):** Used when an interface **consumes/accepts** data. e.g., `Action<in T>`.

**Example:**
```csharp
// Covariance: A List of Dogs is safely assigned to an IEnumerable of Animals
IEnumerable<Animal> animals = new List<Dog>(); 

// Contravariance: An action acting on any Animal can safely act on a Dog
Action<Dog> dogAction = new Action<Animal>(animal => animal.Feed());
```

*   **Pros:** Tremendously enhances code reusability and flexibility in API design (it is the exact reason LINQ operates so smoothly across class hierarchies).
*   **Cons:** It can only be applied to generic *interfaces* and *delegates*, not concrete classes. It is often conceptually confusing to junior developers.

### Q5: What is Reflection? Provide use cases and its drawbacks.
**Answer:** 
Reflection allows a C# program to inspect its own metadata at runtime, and dynamically invoke methods or instantiate objects without knowing them at compile time.

**Example:**
```csharp
// Finding a method by its string name and executing it dynamically
var methodInfo = typeof(MyClass).GetMethod("CalculateTax");
var result = methodInfo.Invoke(myObjectInstance, null);
```

*   **Pros:** Extremely powerful. It is the backbone of modern frameworks, enabling Dependency Injection containers, ORMs (Entity Framework), and dynamic serializers (Newtonsoft.Json).
*   **Cons:** *Extremely slow* performance compared to direct method invocation. It totally bypasses compile-time type safety. It can also break encapsulation (Reflection can be used to forcefully read/write `private` fields).

### Q6: What are Streams in .NET and their practical applications?
**Answer:** 
A Stream (`System.IO.Stream`) is an abstract representation of a sequence of bytes. Streaming allows you to read and process data in small chunks (buffers) rather than loading it all at once.

**Example:** Uploading a large 5GB video file to an API using `Request.Body` (which is a Stream) and copying it incrementally to a `FileStream` on the disk server.

*   **Pros:** Prevents massive High Memory Consumption (`OutOfMemoryException`). Allows processing data identically whether it comes from a hard drive, network socket, or memory.
*   **Cons:** Harder/lower-level to work with than simple strings or byte arrays. Requires strict lifecycle management (you MUST call `Dispose()` or use `using` blocks to prevent file locking).

### Q7: What is the Task Parallel Library (TPL) and how does it differ from async/await?
**Answer:** 
`async/await` is for **I/O-bound** work (waiting for API/DB responses). It frees the thread. TPL (`Parallel.For`, `PLINQ`) is for **CPU-bound** work. It heavily utilizes the ThreadPool to physically schedule calculations across multiple CPU cores simultaneously.

**Example:**
```csharp
// TPL for CPU bounds tasks: applying a complex filter to 100,000 images simultaneously across all CPU cores
Parallel.ForEach(images, img => img.ApplyFilter());
```

*   **Pros:** `async/await` safely maximizes web server throughput under high load. TPL drastically reduces physical processing time for heavy mathematical or analytical tasks.
*   **Cons:** Wrongly using TPL for I/O operations will rapidly exhaust the ThreadPool (thread starvation). Using synchronous blocking `.Result` on `async` tasks causes devastating deadlocks.

---

## Part 2: Entity Framework Core

### Q8: How do you use Stored Procedures in Entity Framework Core?
**Answer:** 
EF Core executes stored procedures using raw SQL methods directly on the `DbSet`.

**Example:**
```csharp
// Safe string interpolation protecting against SQL Injection
var user = context.Users.FromSqlInterpolated($"EXEC GetUserById {userId}").ToList();
```

*   **Pros:** Allows utilizing highly complex, highly optimized legacy SQL code or DB-specific features that LINQ cannot translate. `FromSqlInterpolated` automatically parameterizes inputs, preventing SQL Injection.
*   **Cons:** Logic is hidden in the DB (harder for pure C# devs to track). Breaks database agnosticism (locks you into SQL Server, breaking Oracle/Postgres compatibility).

### Q9: Explain Inheritance Mappings in EF Core (TPH, TPT, TPC).
**Answer:** 
Mapping a C# object hierarchy (Base `Vehicle`, derived `Car` and `Truck`) to SQL relations.
1.  **Table Per Hierarchy (TPH):** One database table (`Vehicles`), uses a `Discriminator` column. 
2.  **Table Per Type (TPT):** Base table (`Vehicles`), separate specific tables (`Cars`). 
3.  **Table Per Concrete Type (TPC):** No base table. Two completely separate tables (`Cars`, `Trucks`) duplicating base columns.

*   **Pros/Cons (TPH):** **Pros:** Exceptional query performance (no slow JOINs). **Cons:** Wasted space; the table is bloated with NULL columns for properties that don't apply to a specific row type.
*   **Pros/Cons (TPT):** **Pros:** Highly normalized, exact and clean schema. **Cons:** Terrible performance due to massive `JOIN` statements generated to reconstruct a single object.
*   **Pros/Cons (TPC):** **Pros:** Faster queries than TPT. No null column bloat. **Cons:** Schema duplication makes global base-level changes annoying.

### Q10: How do you handle Code First Migrations and reverting them?
**Answer:**
Running `Add-Migration <Name>` creates a C# snapshot. `Update-Database` applies it. To revert, you use `Update-Database <NameOfPreviousGoodMigration>`.

**Example:** You run `Update-Database InitialCreate` to roll the DB completely back to its first state, running all the `Down()` methods automatically.

*   **Pros:** Keeps database schema strictly version-controlled in Git alongside the C# models. Ensures identical schemas across Dev, Staging, and Prod.
*   **Cons:** Complex merge-conflicts when working in large teams modifying the same entities. Automatic migrations sometimes generate terribly inefficient SQL for complex index creations or data seeding.

### Q11: Explain Deferred Execution in LINQ (IEnumerable vs IQueryable).
**Answer:** 
When you write a LINQ query (`IQueryable`), it is **not executed** immediately. It simply builds an expression tree. It only hits the database when iterated over. `IEnumerable` executes the query immediately, pulls ALL data into server RAM, and filters locally.

**Example:**
```csharp
// Builds the query mapping tree, DOES NOT contact SQL server yet
var query = db.Users.Where(u => u.Age > 18); 

// Dynamically adding to the tree based on business logic
if (onlyActive) query = query.Where(u => u.IsActive); 

// ONLY NOW does it convert the tree to SQL, send it to the DB, and get results
var result = query.ToList(); 
```

*   **Pros:** Extremely powerful for dynamic query building over multiple service layers. Minimizes data transferred over the network from the DB.
*   **Cons:** Can easily cause the dreaded `N+1 Query Problem` if a developer accidentally puts an un-materialized `IQueryable` inside a `foreach` loop, triggering thousands of individual SQL calls.

---

## Part 3: Angular, RxJS & JavaScript

### Q12: How do you loop over object properties in JavaScript?
**Answer:**
You can use `for...in`, `Object.keys(obj)`, `Object.values(obj)`, or `Object.entries(obj)`.

**Example:**
```javascript
// Modern robust approach
Object.entries(userObj).forEach(([key, val]) => {
    console.log(`Key: ${key}, Value: ${val}`);
});
```

*   **Pros:** `Object.entries` is clean and elegant, integrating perfectly with powerful array methods like `.map` and `.filter`.
*   **Cons:** The old `for...in` loop is dangerous because it can unpredictably iterate over inherited prototype properties if you don't aggressively filter it using `.hasOwnProperty()`.

### Q13: Explain Hoisting in JavaScript.
**Answer:** 
Hoisting is a JS mechanism where declarations (but not initializations) are "moved" to the top of their scope before execution.

**Example:**
```javascript
sayHello(); // This works! Function declarations are fully hoisted.
function sayHello() { console.log("Hello"); }
```

*   **Pros:** Allows organizing functions cleanly at the bottom of the file while calling them at the top, improving file readability.
*   **Cons:** Using legacy `var` is dangerous; it hoists uninitialized as `undefined` leading to severely elusive bugs. (Modern TS/JS strictly uses `let`/`const` to force a 'Temporal Dead Zone' error instead).

### Q14: Constructor vs ngOnInit lifecycle hook in Angular.
**Answer:**
Constructors strictly inject services. `ngOnInit` handles component initialization after Angular finalizes `@Input` bindings.

**Example:**
```typescript
constructor(private http: HttpClient) { } // Only DI here

ngOnInit() { 
    // Inputs are ready, safe to fetch data
    this.http.get(this.apiUrl).subscribe(...); 
}
```

*   **Pros (`ngOnInit`):** Guarantees `@Input()` data is fully ready. Drastically easier to mock data in Unit Tests because instantiating the class doesn't automatically trigger eager HTTP calls in the constructor.
*   **Cons:** Forgetting to move heavy initialization logic out of the constructor is a very common source of silent binding bugs.

### Q15: Difference between switchMap, mergeMap, and concatMap in RxJS.
**Answer:** 
Mapping operators handle an outer observable triggering inner observables (like HTTP calls).
*   **`mergeMap` (Parallel):** Subscribes to all immediately. 
*   **`switchMap` (Cancel Previous):** Subscribes to newest, strictly cancels the older one.
*   **`concatMap` (Sequential):** Queues them one by one.

**Example:**
*   Typeahead autocomplete search: **MUST use `switchMap`** (cancels old searches).
*   Saving 5 files simultaneously: **Use `mergeMap`**.
*   A strict step-by-step e-commerce checkout flow: **Use `concatMap`**.

*   **Pros:** Incredibly powerful asynchronous control structures natively completely solving race conditions (`switchMap`).
*   **Cons:** Using the wrong operator causes catastrophic bugs (e.g., using `mergeMap` for search typeaheads will result in older/slower API request resolving last, overwriting new correct results on the UI).

### Q16: What is NgRx? Outline Actions, Reducers, Selectors, and Effects.
**Answer:** 
NgRx is a state management library based on Redux. Components dispatch `Actions`. `Effects` catch actions to do HTTP calls. `Reducers` take Actions to clone/update the immutable Store State. `Selectors` query the store for UI rendering.

**Example:**
Dispatching `[UserList] Load users` Action -> `Effect` intercepts and calls HTTP GET -> API returns `[UserList] Load loaded_Success` Action -> `Reducer` caches data -> UI Component updates instantly via `Selector`.

*   **Pros:** Strict unidirectional data flow. Highly predictable state. Phenomenal debugging ecosystem (Redux DevTools allows exactly "replaying" a bug step-by-step).
*   **Cons:** Massive amount of boilerplate files. Way too complex, heavy, and overkill for simple CRUD applications.

### Q17: What is Module Federation?
**Answer:** 
Module Federation (Webpack 5) is a Micro-Frontend architecture allowing separate isolated Angular apps to share code remotely at runtime.

**Example:** A `Dashboard` Angular repository dynamically pulling and rendering a `Payment Widget` component written and deployed by completely different codebase team.

*   **Pros:** True enterprise scalability. Separate teams build, test, and deploy features entirely independently without constantly rebuilding a colossal monolithic host app.
*   **Cons:** Severe configuration complexity regarding shared routing, managing global state across micro-apps, and resolving strict dependency version conflicts (e.g., App A uses RxJS 6, App B uses RxJS 7).

---

## Part 4: Web API & Software Architecture

### Q18: What are REST principles? (Content Negotiation and Versioning)
**Answer:** 
REST enforces statelessness, standard HTTP verbs, and standard status codes. Content Negotiation allows clients to request specific data formats via HTTP Headers. Versioning guarantees API stability.

**Example:**
Client sends HTTP GET with Header `Accept: application/json`. API versions via URI: `GET /api/v1/users/5`.

*   **Pros:** Universally standardized and language-agnostic. Extremely easy for third-party partners to consume without special sdks.
*   **Cons:** Suffers severely from Over-fetching (downloading gigabytes of fields you don't need) or Under-fetching (requiring 5 separate API endpoints to render one page). Technologies like *GraphQL* specifically exist to solve these cons.

### Q19: Explain CORS and Preflight Requests.
**Answer:** 
CORS (Cross-Origin Resource Sharing) defaults browsers to blocking requests between different ports/domains. Preflights are automatic `OPTIONS` requests asking for server permission.

**Example:** Browser automatically sends `OPTIONS /api/data`. Server responds `Access-Control-Allow-Origin: http://localhost:4200`. The browser then proceeds to send the real `POST /api/data`.

*   **Pros:** An absolutely critical browser security feature preventing malicious background scripts on sketchy websites from hijacking the user's browser to make API calls to their bank.
*   **Cons:** Notoriously frustrating to configure correctly in Development environments, leading to confusing "CORS Error" red text in browser consoles.

### Q20: How do Anti-forgery tokens prevent CSRF attacks?
**Answer:** 
CSRF tricks an authenticated browser into sending forged requests. Forgery tokens pair a cryptographic hash sent via Cookie with a hash required in the form body/HTTP header. 

**Example:** 
```html
<!-- Hidden token injected by .NET -->
<input type="hidden" name="__RequestVerificationToken" value="...hash..." />
```

*   **Pros:** Perfectly and transparently secures state-changing endpoints (POST/PUT/DELETE) from Cross-Site Request Forgery hacks.
*   **Cons:** Adds implementation overhead. Furthermore, it is *only useful* for Cookie/Session-based authentication architectures. It is essentially useless for purely JWT-based SPA APIs (since JWTs are stored in LocalStorage, they are not automatically attached to rogue requests like Cookies are).

### Q21: What is the Unit of Work design pattern?
**Answer:** 
Coordinates the work of multiple Repositories by sharing a single underlying `DbContext` allowing a single atomic database transaction.

**Example:**
```csharp
_uow.UserRepository.Add(newUser);
_uow.AuditRepository.Add(newLog);
_uow.SaveChanges(); // Commits BOTH to DB simultaneously safely.
```

*   **Pros:** Guarantees absolute transactional safety and ACID compliance. If the audit log fails inserted, the user creation is totally rolled back.
*   **Cons:** Heavily debated in modern C#. Often considered an "anti-pattern" over-abstraction because Entity Framework's `DbContext` *internally implements* Unit of Work out of the box natively.

### Q22: Singleton Pattern vs Static Classes.
**Answer:** 
Both provide global instances.

**Example:** `services.AddSingleton<ICache, RedisCache>();` registered in `Program.cs`.

*   **Pros (Singleton):** Is a real instantiated object. It can implement interfaces, utilize Dependency Injection, and is incredibly easy to mock for Unit Testing.
*   **Cons (Static):** Rigid. Cannot be passed as a parameter. Cannot use DI gracefully. Essentially holds memory forever. Very prone to devastating thread-safety/concurrency bugs if it holds mutable state in a web server.

---

## Part 5: MS SQL Server Advanced

### Q23: What are Magic Tables in SQL Server Triggers?
**Answer:** 
`INSERTED` and `DELETED` are virtual tables existing purely during trigger execution to track the exact state before and after the modification.

**Example:**
```sql
CREATE TRIGGER AuditTrng ON Users AFTER UPDATE AS BEGIN 
    -- Tracks the exact new updated Email address to a log
    INSERT INTO Logs SELECT Id, Email FROM INSERTED; 
END
```

*   **Pros:** Allows writing highly reliable audit logs perfectly tracking the exact row changes deep inside the DB engine safely.
*   **Cons:** Triggers represent "invisible/hidden" logic that devs easily forget. Because they execute synchronously, a heavy trigger will drastically slow down every `UPDATE` or `INSERT` on that table.

### Q24: Explain Clustered vs. Non-Clustered Indexes deeply.
**Answer:**
**Clustered:** Dictates the physical hard-drive sorting order (only 1 allowed, usually PK). Data is in the leaf node.
**Non-Clustered:** A separate index structure (like a book index) pointing to the actual data (many allowed).

**Example:** Clustered index on `Id` column. Non-clustered on `Email` column for fast login lookups.

*   **Pros (Clustered):** Exceptionally fast for range scans (`WHERE Id BETWEEN 1 AND 100`).
*   **Pros (Non-Clustered):** Massively speeds up specific slow `WHERE` clauses without reorganizing physical data.
*   **Cons:** Every single index you add significantly slows down `INSERT`, `UPDATE`, and `DELETE` operations because the SQL engine must recalculate and rebuild the index tree on disk.

### Q25: What is the MERGE statement?
**Answer:** 
An "UPSERT" executing in a single atomic SQL command based on matching join conditions.

**Example:**
```sql
MERGE TargetTable AS T USING SourceTable AS S ON T.Id = S.Id 
WHEN MATCHED THEN UPDATE SET Value = S.Value 
WHEN NOT MATCHED THEN INSERT (Id, Value) VALUES (S.Id, S.Value);
```

*   **Pros:** Considerably cleaner code than writing complex `IF EXISTS... ELSE` blocks. Highly performant single execution compilation plan.
*   **Cons:** Extremely complex syntax. Historically plagued by severe concurrency race condition bugs under high load unless strict `(HOLDLOCK)` table hints are carefully applied.

### Q26: Explain Database Isolation Levels and Commit/Savepoints.
**Answer:** 
Isolation levels dictate how aggressively locks are applied during concurrent access. Checkpoints are markers for partial rollbacks.

**Example:** `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;`

*   **Pros:** High isolation levels (like Serializable) ensure perfect data integrity, completely eliminating "Phantom Reads" in highly-sensitive transactional systems (finance apps).
*   **Cons:** High isolation levels drastically increase database blocking and deadlocks, devastating application concurrency and overall performance. Lower levels (Read Uncommitted) are lightning-fast but risk reading dirty corrupted data.

---

## Part 6: Supplementary Core Concepts

### Q27: `ref` and `out` keywords in C#
**Answer:** Both pass arguments by reference instead of by value.
*   `ref`: The variable **must** be initialized *before* passing it to the method.
*   `out`: The variable does **not** need initialization beforehand, but the method **must** assign a value to it before returning.

**Example:**
```csharp
bool success = int.TryParse("123", out int result); // We get both a boolean and the parsed int
```
*   **Pros:** Allows returning multiple values from a single method efficiently without creating tuple objects.
*   **Cons:** Mutating parameters can lead to confusing side-effects (violates pure functions).

### Q28: Dependency Injection Lifetimes (Transient, Scoped, Singleton)
**Answer:**
*   **Transient:** A new instance is created *every single time* it is requested.
*   **Scoped:** A new instance is created *once per HTTP request*. All classes sharing the request get the exact same instance.
*   **Singleton:** A single instance is created when the app starts and is used universally thereafter.

**Example:** `builder.Services.AddScoped<IUserRepository, UserRepository>()`

*   **Pros:** Enforces loosely coupled, highly testable code. Scoped perfectly matches the web request lifecycle, preventing cross-tenant user data leaks.
*   **Cons:** Accidental "Captive Dependencies" (injecting a Transient service into a Singleton permanently traps it as a Singleton forever, often causing memory leaks).

### Q29: ASP.NET Core Filters Pipeline
**Answer:** Filters run at different stages of the request pipeline.
1.  **Authorization:** Runs first. Confirms the user has permission.
2.  **Resource:** Runs after auth, before model binding. Great for Caching.
3.  **Action:** Runs right before and after the Controller method executes.
4.  **Exception:** Runs if an unhandled exception occurs in the controller.
5.  **Result:** Runs before and after the view/JSON result executes.

**Example:** `[Authorize(Roles="Admin")]` placed atop a controller.

*   **Pros:** Prevents code duplication by centralizing cross-cutting concerns (logging, global auth validation).
*   **Cons:** Excessive/nested filters make the request pipeline extremely complex to debug sequentially.

### Q30: JWT Access Tokens vs Refresh Tokens
**Answer:**
*   **Access Token:** Short-lived (e.g., 15 mins). Contains user claims. Sent with every API request via the `Authorization: Bearer` header.
*   **Refresh Token:** Long-lived (e.g., 7 days). Stored securely (e.g., HTTP-only cookie). Used *only* to request a new Access Token from the auth server when the old one expires.

**Example:** API returns `401 Unauthorized` -> Angular interceptor catches it -> quietly calls POST `/api/refresh` -> retries the original request.

*   **Pros:** If an attacker steals an Access Token, it becomes useless quickly. The Refresh Token can be deleted server-side to forcefully revoke a user's session globally.
*   **Cons:** Moderately complex to implement securely on the frontend (requires silent HTTP interceptors to manage token rotation matrices).

### Q31: Promises (JS) vs Observables (RxJS)
**Answer:**
*   **Promise:** Eager (executes immediately). Returns exactly *one* value. Cannot be cancelled once fired.
*   **Observable:** Lazy (executes only when `.subscribe()` is called). Can emit *multiple* values over time. Can be gracefully cancelled (`.unsubscribe()`).

**Example:** A Promise is buying a book (one item eventually). An Observable is subscribing to a magazine (streams of items over time until you cancel it).

*   **Pros (Observable):** Incredible algorithmic control over data streams (cancellation, retrying, debouncing keystrokes on search boxes).
*   **Cons (Observable):** Massive learning curve compared to native `async/await` Promises. Forgetting to unsubscribe in Angular causes disastrous memory leaks.

### Q32: Default vs OnPush Change Detection in Angular
**Answer:**
*   **Default:** Angular checks absolutely every component in the entire DOM tree every time a browser event occurs anywhere.
*   **OnPush:** Angular skips checking the component entirely *unless* its `@Input()` reference completely changes, or an internal Observable explicitly fires an async pipe.

**Example:** Setting `changeDetection: ChangeDetectionStrategy.OnPush` on a large Dashboard component.

*   **Pros (OnPush):** Massively improves rendering performance in huge enterprise data grids by skipping redundant checking.
*   **Cons (OnPush):** Mutating an object property (like `user.name = 'Bob'`) won't trigger UI updates because the memory reference didn't change. You must assign a completely new cloned object reference.

### Q33: Angular - Directives vs Pipes vs Interceptors
**Answer:** 
*   **Structural Directive (`*ngIf`, `*ngFor`):** Changes the DOM **structure** (creates or destroys DOM elements).
*   **Attribute Directive (`ngClass`, `ngStyle`):** Changes a DOM element's **appearance or behavior** without destroying it.
*   **Pipes (`date`, `currency`):** Transforms data exclusively for UI display. 
    *   **Pure Pipe:** Only recalculates if primitive input values change. Highly performant.
    *   **Impure Pipe:** Recalculates aggressively on every single DOM digest cycle. Very bad for app performance.
*   **HttpInterceptor:** Middleware that catches all outgoing HTTP requests (to inject JWTs) or catches incoming responses (to handle global 401s).

### Q34: EF Core - Dealing with the N+1 Query Problem
**Answer:** Occurs when EF Core triggers one initial query to load 100 parents (N=1), and then loops through them, firing 100 separate sub-queries to lazily load their children.

**Example:**
*   *Bad (N+1):* `foreach (var c in db.Customers) { print(c.Orders.Count); }` (Triggers 101 queries)
*   *Fix (Eager Loading):* `var cust = db.Customers.Include(c => c.Orders).ToList();` (Triggers 1 single optimized query)

*   **Pros of Fix:** Executes exactly 1 efficient SQL join, saving 100 network round trips to the DB server.
*   **Cons ofFix:** Eager loading too many deeply nested tables (`Include().ThenInclude().ThenInclude()`) generates gigantic Cartesian Product datasets that can instantly crash the API server's RAM.

### Q35: SQL Knowledge - Cross Join vs Window Functions
**Answer:**
*   **Cross Join:** Returns the Cartesian product of two tables (every single row from Table A matched with every single row from Table B). Usually a sign of a critical bug/missing `ON` clause, causing massive data explosions.
*   **Window Functions (`OVER (PARTITION BY ...)`):** Performs mathematical calculations across a set of rows associated with the current row, *without* collapsing them into a single summary row like `GROUP BY` does.

**Example:** Determining the Running Total of sales over time, or Ranking salespeople individually within their specific departments without destroying the rest of the table data.
