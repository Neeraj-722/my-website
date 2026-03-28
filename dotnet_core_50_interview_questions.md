# Comprehensive .NET Core Interview Guide

This guide contains detailed .NET Core interview questions complete with answers, examples, use cases, pros, and cons.

## 1. What is .NET Core?

**Answer:**
.NET Core (now just .NET 5+) is an open-source, cross-platform, modular, and high-performance framework developed by Microsoft for building modern, cloud-based, and internet-connected applications.

**Example:**
Using the .NET CLI to create an app: `dotnet new console -n MyTask`

**Use Cases:**
- Building microservices, REST APIs, Web Applications, and Cloud-native apps.

**Pros & Cons:**
*   **Pros:** Cross-platform (Windows, Linux, macOS), highly performant, modular architecture, unified API.
*   **Cons:** Legacy .NET Framework applications (WebForms, WCF) require significant rewrites to migrate.

---

## 2. What is the difference between .NET Core and .NET Framework?

**Answer:**
.NET Framework is Windows-only and deeply tied to the Windows OS, utilizing heavy setups. .NET Core is cross-platform, open-source, modular (NuGet-based), and optimized for the cloud and microservices.

**Example:**
- .NET Framework: Relies on `System.Web` and IIS.
- .NET Core: Uses Kestrel server and can run on Nginx, Apache, or Docker.

**Use Cases:**
- .NET Framework: Maintaining legacy Windows desktop apps (WPF/WinForms) or WebForms.
- .NET Core: New greenfield enterprise applications, Dockerized microservices.

**Pros & Cons:**
*   **Core Pros:** Faster performance, side-by-side versioning, container-friendly.
*   **Core Cons:** Lacks support for specific legacy Windows libraries.

---

## 3. What is Kestrel?

**Answer:**
Kestrel is the default, cross-platform, open-source, event-driven, asynchronous web server used to host .NET Core web applications. 

**Example:**
In `Program.cs`, it is automatically configured when you call `WebApplication.CreateBuilder(args)`.

**Use Cases:**
- Used as an edge server or, more commonly, behind a reverse proxy like IIS, Nginx, or Apache.

**Pros & Cons:**
*   **Pros:** Exceptionally fast, lightweight, supports HTTP/2 and HTTP/3.
*   **Cons:** Not meant to be an internet-facing edge server without a reverse proxy in highly secure or complex structural setups (though it has improved significantly).

---

## 4. What is Middleware in .NET Core?

**Answer:**
Middleware refers to software components assembled into an application pipeline to handle HTTP requests and responses. Each component chooses whether to pass the request to the next component in the pipeline.

**Example:**
```csharp
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
```

**Use Cases:**
- Authentication, logging, exception handling, CORS policy, routing.

**Pros & Cons:**
*   **Pros:** Highly modular request pipeline, lightweight, easy to test.
*   **Cons:** Order matters strictly; placing `UseAuthorization()` before `UseRouting()` will break the app.

---

## 5. How does Dependency Injection (DI) work in .NET Core?

**Answer:**
.NET Core has a built-in lightweight DI container (`IServiceCollection`). It allows the application to resolve dependencies automatically rather than manually instantiating classes using the `new` keyword.

**Example:**
```csharp
// In Program.cs
builder.Services.AddScoped<IUserService, UserService>(); // Register

// In Controller
public UserController(IUserService userService) { ... } // Inject
```

**Use Cases:**
- Injecting database contexts, logging services, caching managers.

**Pros & Cons:**
*   **Pros:** Inversion of Control, extreme testability via mocking, decoupled architecture.
*   **Cons:** Over-injecting can lead to complex "constructor bloat."

---

## 6. What are the Service Lifetimes in .NET Core DI?

**Answer:**
1.  **Transient (`AddTransient`):** A new instance is created *every single time* it is requested.
2.  **Scoped (`AddScoped`):** A new instance is created *once per HTTP request*.
3.  **Singleton (`AddSingleton`):** A single instance is created the first time it is requested and shared across the entire application lifespan.

**Example:**
```csharp
builder.Services.AddTransient<IOperationTransient, Operation>();
builder.Services.AddScoped<IOperationScoped, Operation>();
builder.Services.AddSingleton<IOperationSingleton, Operation>();
```

**Use Cases:**
- **Transient:** Lightweight formatting helpers or stateless utilities.
- **Scoped:** Database contexts (`DbContext`), Unit of Work patterns.
- **Singleton:** In-memory caching services, configuration singletons.

**Pros & Cons:**
*   **Pros:** Granular memory management.
*   **Cons:** Capturing a Scoped service inside a Singleton causes unexpected bugs (Captive Dependency).

---

## 7. What is the Options Pattern in .NET Core?

**Answer:**
The Options Pattern is used to bind strongly-typed classes to configuration settings (e.g., from `appsettings.json`), allowing configuration data to be injected via DI.

**Example:**
```csharp
// appsettings.json
"SmtpConfig": { "Server": "smtp.gmail.com", "Port": 587 }

// Class
public class SmtpConfig { public string Server { get; set; } public int Port { get; set; } }

// Registration
builder.Services.Configure<SmtpConfig>(builder.Configuration.GetSection("SmtpConfig"));

// Injection
public EmailService(IOptions<SmtpConfig> options) { var server = options.Value.Server; }
```

**Use Cases:**
- Managing configurations like database strings, third-party API keys, and SMTP configs.

**Pros & Cons:**
*   **Pros:** Type safety for configurations, follows Interface Segregation Principle.
*   **Cons:** Slight boilerplate required for setting up configuration classes.

---

## 8. What is the difference between `IOptions`, `IOptionsSnapshot`, and `IOptionsMonitor`?

**Answer:**
- **`IOptions<T>`:** Registered as a Singleton. Configuration values are read once and cannot detect changes without restarting the app.
- **`IOptionsSnapshot<T>`:** Registered as Scoped. Configuration values are read upon each HTTP request, picking up `appsettings.json` changes.
- **`IOptionsMonitor<T>`:** Registered as a Singleton. Provides an event listener (`OnChange`) to notify the app when the underlying configuration file changes.

**Use Cases:**
- **`IOptions`:** Static settings like API base URLs.
- **`IOptionsSnapshot`:** Feature flags evaluated per request.
- **`IOptionsMonitor`:** Real-time logging level changes without restarting.

---

## 9. How do you implement Global Exception Handling?

**Answer:**
You can build custom middleware to catch all unhandled exceptions, log them, and return a standardized JSON error response rather than crashing or showing a YSOD (Yellow Screen of Death). Alternatively, .NET Core provides `UseExceptionHandler`.

**Example:**
```csharp
app.UseExceptionHandler(errorApp => {
    errorApp.Run(async context => {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync("{\"error\": \"Internal Server Error\"}");
    });
});
```

**Use Cases:**
- Preventing sensitive stack trace data from leaking to users.
- Centralizing logging to Datadog/Sentry.

**Pros & Cons:**
*   **Pros:** Clean architecture, prevents application crashes.

---

## 10. What are Action Filters?

**Answer:**
Action Filters allow you to run code before or after a specific Action Method executes in a Controller.

**Example:**
```csharp
public class ValidateModelStateAttribute : ActionFilterAttribute {
    public override void OnActionExecuting(ActionExecutingContext context) {
        if (!context.ModelState.IsValid) {
            context.Result = new BadRequestObjectResult(context.ModelState);
        }
    }
}

[ValidateModelState] // Applied to action or controller
public IActionResult Post(MyModel data) { ... }
```

**Use Cases:**
- Automatic Model validation, caching, performance profiling, and logging execution times.

**Pros & Cons:**
*   **Pros:** DRY (Don't Repeat Yourself) principle, keeps controllers clean.
*   **Cons:** Overuse can obscure the controller's actual behavior; hidden logic.

---

## 11. Explain Routing in .NET Core (Convention vs Attribute).

**Answer:**
Routing matches incoming HTTP requests to executable endpoints.
- **Convention-based:** Defines global routing templates usually in `Program.cs` (e.g., `{controller=Home}/{action=Index}/{id?}`).
- **Attribute-based:** Uses attributes directly on controllers and actions to map URLs.

**Example:**
```csharp
[Route("api/users")]
public class UsersController : ControllerBase {
    [HttpGet("{id}")]
    public IActionResult GetUser(int id) { ... }
}
```

**Use Cases:**
- **Convention:** Traditional MVC web applications.
- **Attribute:** RESTful APIs where URL structures are specific and versioned.

**Pros & Cons:**
*   **Attribute Pros:** Highly explicit, easier to version APIs (`api/v1/users`).
*   **Convention Pros:** Less repetitive code for standard MVC pages.

---

## 12. What are Minimal APIs?

**Answer:**
Minimal APIs are a feature introduced in .NET 6 to build lightweight APIs without the overhead of Controllers, MVC routing, or boilerplate setup.

**Example:**
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/hello", () => "Hello World!");

app.Run();
```

**Use Cases:**
- Microservices, simple serverless functions, basic prototyping.

**Pros & Cons:**
*   **Pros:** Extremely low ceremony, high performance, less boilerplate code.
*   **Cons:** Lacks structured organization (like Controllers) out of the box, making massive APIs harder to manage without custom architecture.

---

## 13. What is `appsettings.json`?

**Answer:**
It is the standard configuration file used in .NET Core (JSON format), replacing the older `web.config` XML file from the .NET Framework era.

**Example:**
```json
{
  "Logging": { "LogLevel": { "Default": "Information" } },
  "ConnectionStrings": { "DefaultConnection": "Server=...;Database=..." }
}
```

**Use Cases:**
- Storing environment-specific variations (e.g., `appsettings.Development.json` vs `appsettings.Production.json`).

**Pros & Cons:**
*   **Pros:** Native JSON format, highly readable, dynamically overridable by environment variables.
*   **Cons:** Never store raw passwords/secrets here; use User Secrets or Azure Key Vault.

---

## 14. How do you manage secrets during local development?

**Answer:**
.NET Core provides the "Secret Manager" (User Secrets) to store sensitive data (API keys, connection strings) on your local developer machine outside the project folder so it never gets committed to Source Control.

**Example:**
```bash
dotnet user-secrets init
dotnet user-secrets set "DbPassword" "SuperSecret123!"
```
The application accesses it normally: `builder.Configuration["DbPassword"]`.

**Use Cases:**
- Local API keys, development database passwords.

**Pros & Cons:**
*   **Pros:** Prevents accidental Git commits of credentials.
*   **Cons:** Only meant for local dev. Production requires Azure Key Vault, AWS Secrets Manager, or environment variables.

---

## 15. What is Entity Framework Core (EF Core)?

**Answer:**
EF Core is an open-source, lightweight, extensible Object-Relational Mapper (ORM) for .NET. It lets developers work with databases using .NET objects rather than raw SQL.

**Example:**
```csharp
public class AppDbContext : DbContext {
    public DbSet<User> Users { get; set; }
}

// Querying
var user = _context.Users.FirstOrDefault(u => u.Id == 1);
```

**Use Cases:**
- CRUD operations, database schema migrations, and rapid application data development.

**Pros & Cons:**
*   **Pros:** LINQ support, built-in migration system, database agnostic (SQL Server, Postgres, SQLite).
*   **Cons:** Can generate slow/inefficient SQL queries if relationships are complex and LINQ is used poorly.

---

## 16. Code-First vs Database-First in EF Core?

**Answer:**
- **Code-First:** You create C# POCO classes, and EF Core generates the database tables and columns using Migrations based on those classes.
- **Database-First (Reverse Engineering):** You scaffold C# DbContext and entity classes from an already existing database schema.

**Example:**
- Code-First: `dotnet ef migrations add Initial` -> `dotnet ef database update`
- Db-First: `dotnet ef dbcontext scaffold "ConnectionData" Microsoft.EntityFrameworkCore.SqlServer`

**Use Cases:**
- **Code First:** Greenfield projects with no existing database.
- **Db First:** Migrating legacy enterprise databases into a new .NET Core app.

---

## 17. What is `IQueryable` vs `IEnumerable`?

**Answer:**
- **`IEnumerable<T>`:** Executes the query immediately in memory. If you apply a `.Where()` clause after fetching it, the filtering happens on the client/application side.
- **`IQueryable<T>`:** Builds an expression tree. The SQL query is only sent to the database when the data is enumerated (e.g., calling `.ToList()`). This ensures filtering (`.Where()`) happens on the SQL Server side.

**Example:**
```csharp
// IEnumerable - fetches all users from SQL, filters in memory
IEnumerable<User> users = dbContext.Users; 
var active = users.Where(u => u.IsActive).ToList();

// IQueryable - generates "SELECT * FROM Users WHERE IsActive = 1"
IQueryable<User> query = dbContext.Users;
var activeQuery = query.Where(u => u.IsActive).ToList();
```

**Use Cases:**
- **`IEnumerable`:** Small in-memory collections, Lists.
- **`IQueryable`:** Any database calls via EF Core to maximize SQL execution efficiency.

---

## 18. What is the Unit of Work Pattern?

**Answer:**
The Unit of Work pattern maintains a list of objects affected by a business transaction. It coordinates writing those changes out as a single, atomic transaction. In .NET Core, `DbContext` itself naturally implements the Unit of Work pattern (`SaveData()`).

**Use Cases:**
- Managing highly complex database transactions across multiple repositories.

**Pros & Cons:**
*   **Pros:** Prevents partial database updates; ensures data integrity.
*   **Cons:** Often redundant because EF Core `DbContext` already implements this. Creating wrappers around it can be an anti-pattern.

---

## 19. What is the Repository Pattern?

**Answer:**
The Repository Pattern abstracts the data access logic behind an interface, decoupling the business logic from direct EF Core calls (like `DbContext`).

**Example:**
```csharp
public interface IUserRepository {
    Task<User> GetByIdAsync(int id);
}
public class UserRepository : IUserRepository {
    private readonly AppDbContext _context;
    public async Task<User> GetByIdAsync(int id) => await _context.Users.FindAsync(id);
}
```

**Use Cases:**
- Enforcing Domain-Driven Design (DDD), facilitating easy unit testing via interface mocking.

**Pros & Cons:**
*   **Pros:** Decoupling, highly testable (mock `IUserRepository`).
*   **Cons:** Can create massive boilerplate. Some argue `DbContext` and `DbSet` are already repositories, making wrappers mostly redundant.

---

## 20. Explain Authentication vs Authorization in .NET Core.

**Answer:**
- **Authentication:** Verifying *who* the user is (e.g., Logging in via username/password, validating a JWT token).
- **Authorization:** Verifying *what* the authenticated user is allowed to do (e.g., checking if the user has an "Admin" role to delete a file).

**Example:**
```csharp
// Authentication middleware validating token
app.UseAuthentication(); 

// Authorization middleware enforcing roles/policies
app.UseAuthorization(); 

[Authorize(Roles = "Admin")] // Authorization Attribute
public IActionResult Delete() { ... }
```

---

## 21. What is Policy-Based Authorization?

**Answer:**
Instead of restricting access by straightforward "Roles", Policy-Based Authorization relies on evaluating complex business rules and logic (Claims) to grant access.

**Example:**
```csharp
// Setup Policy
builder.Services.AddAuthorization(options => {
    options.AddPolicy("Over18Policy", policy => policy.RequireClaim("Age", "18", "19", "20+"));
});

// Usage
[Authorize(Policy = "Over18Policy")]
public class AdultController : Controller { }
```

**Use Cases:**
- Granular permissions like "User can only edit documents they created" or "Must be a senior manager to approve this amount".

**Pros & Cons:**
*   **Pros:** Extremely scalable and flexible for complex enterprise security.
*   **Cons:** Harder to manage than simple Role checks.

---

## 22. How do you implement CORS (Cross-Origin Resource Sharing)?

**Answer:**
CORS is a browser security feature that prevents a web application running at one origin (e.g., `localhost:4200`) from accessing APIs at a different origin (e.g., `localhost:5000`). In .NET Core, you enable it via middleware.

**Example:**
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAngularApp", policy => {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

app.UseCors("AllowAngularApp");
```

**Use Cases:**
- Allowing an Angular SPAs to fetch data from your .NET API.

---

## 23. What are Background Services (IHostedService)?

**Answer:**
`IHostedService` allows you to run asynchronous background tasks in your ASP.NET Core application outside the normal request-response HTTP cycle. A common implementation is extending `BackgroundService`.

**Example:**
```csharp
public class TimedWorker : BackgroundService {
    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        while (!stoppingToken.IsCancellationRequested) {
            Console.WriteLine("Running background job...");
            await Task.Delay(10000, stoppingToken);
        }
    }
}
// Add to DI: builder.Services.AddHostedService<TimedWorker>();
```

**Use Cases:**
- Long-running polling, sending batch emails, database cleanups, listening to RabbitMQ queues.

**Pros & Cons:**
*   **Pros:** Built-in solution for background threads, bound to the app lifecycle.
*   **Cons:** If the application crashes or scales down, the task dies. Consider Hangfire or Azure Functions for resilient distributed jobs.

---

## 24. What are Health Checks?

**Answer:**
Health checks provide an endpoint (`/health`) to monitor the status of the app and its dependencies (like checking if the SQL database is currently reachable).

**Example:**
```csharp
builder.Services.AddHealthChecks()
       .AddSqlServer(builder.Configuration.GetConnectionString("Default"));

app.MapHealthChecks("/health");
```

**Use Cases:**
- Docker/Kubernetes readiness and liveness probes. If the app returns `Unhealthy`, a load balancer can stop routing traffic to that instance.

**Pros & Cons:**
*   **Pros:** Prevents routing traffic to broken nodes.
*   **Cons:** Heavy database checks can cause performance hits if polled too frequently.

---

## 25. What is the HttpClientFactory?

**Answer:**
`IHttpClientFactory` correctly instantiates and manages the lifecycle of `HttpClient` instances. Instantiating `HttpClient` manually via `new HttpClient()` leads to deep port exhaustion issues on servers over time.

**Example:**
```csharp
builder.Services.AddHttpClient("GitHub", client => {
    client.BaseAddress = new Uri("https://api.github.com/");
});

// Injection
public MyService(IHttpClientFactory factory) {
    var client = factory.CreateClient("GitHub");
}
```

**Use Cases:**
- Making outgoing HTTP requests to third-party endpoints.

**Pros & Cons:**
*   **Pros:** Prevents socket exhaustion, manages DNS changes efficiently, allows simple Polly integration (retry policies).
*   **Cons:** Slightly more complex setup than simple instantiation.

---

## 26. What is the difference between `Task` and `ValueTask`?

**Answer:**
- **`Task`:** A reference type allocated on the Heap. Creating many tasks creates garbage that the GC has to clean.
- **`ValueTask`:** A struct type allocated on the Stack. It reduces Heap allocations and GC pressure.

**Use Cases:**
- Use `ValueTask` when an asynchronous method is highly likely to complete synchronously most of the time (e.g., retrieving an item from an in-memory Redis cache).
- Use `Task` for most general API HTTP calls or DB hits that guarantee network delay.

**Pros & Cons:**
*   **ValueTask Pros:** High-performance optimization for frequent sync-completing tasks.
*   **ValueTask Cons:** Complex to use incorrectly (cannot await multiple times).

---

## 27. What happens if you call `.Wait()` or `.Result` on an Async method?

**Answer:**
It forces the execution thread to pause and block synchronously until the async task completes (known as "Sync over Async"). This is highly dangerous and often leads to **Deadlocks** and thread pool starvation in ASP.NET pipelines.

**Use Cases:**
- Rarely acceptable, mostly restricted to isolated Console application setups.

**Pros & Cons:**
*   **Cons:** Never do this. Always use `await`.

---

## 28. What is Memory Caching in .NET Core?

**Answer:**
Memory Caching stores highly accessed, slow-to-compute data in the server's local RAM using `IMemoryCache` to avoid hitting the database repetitively.

**Example:**
```csharp
builder.Services.AddMemoryCache();

// Usage
_cache.GetOrCreate("UsersKey", entry => {
    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
    return dbContext.Users.ToList();
});
```

**Use Cases:**
- Caching dropdown list values, configuration tables, or non-volatile static data.

**Pros & Cons:**
*   **Pros:** Blisteringly fast.
*   **Cons:** State is lost if the server restarts. Will not work in a multi-instance web farm without sticky sessions (Use Distributed Cache instead).

---

## 29. What is Distributed Caching?

**Answer:**
A cache shared by multiple app servers, typically using Redis or SQL Server via `IDistributedCache`. 

**Use Cases:**
- Ensuring session states and cache consistency across load-balanced, scaled-out microservices.

**Pros & Cons:**
*   **Pros:** Cache survives application restarts and scale events.
*   **Cons:** Slower than In-Memory cache due to network latency serialization.

---

## 30. How do you integrate Swagger (OpenAPI) in .NET Core?

**Answer:**
Swagger provides automatic interactive API documentation generation through standard NuGet packages like `Swashbuckle.AspNetCore`.

**Example:**
```csharp
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

**Use Cases:**
- Providing a visual UI for developers and external clients to test API endpoints.

**Pros & Cons:**
*   **Pros:** Instant, living documentation. Allows triggering requests directly from the UI.
*   **Cons:** Should be disabled in production to avoid exposing internal API schemas securely.

---

## 31. Explain environments in .NET Core.

**Answer:**
Environment variables dictate how the app behaves. The default variable is `ASPNETCORE_ENVIRONMENT`. Common values are `Development`, `Staging`, and `Production`.

**Example:**
```csharp
if (app.Environment.IsDevelopment()) {
    app.UseDeveloperExceptionPage(); // Show detailed errors
} else {
    app.UseExceptionHandler("/Home/Error"); // Generic errors
}
```

**Use Cases:**
- Loading specific configurations (e.g., connection to local SQL vs AWS RDS SQL).

---

## 32. What is Data Annotations vs Fluent API in EF Core?

**Answer:**
They are ways to configure the database schema in EF Core.
- **Data Annotations:** Attributes placed directly on class properties (e.g., `[Required]`, `[MaxLength(50)]`).
- **Fluent API:** Configuration logic written in `OnModelCreating` method using `ModelBuilder`.

**Example (Fluent API):**
```csharp
protected override void OnModelCreating(ModelBuilder mb) {
    mb.Entity<User>().HasIndex(u => u.Email).IsUnique(); 
}
```

**Use Cases:**
- **Annotations:** Basic validation and required fields. Keep models readable.
- **Fluent API:** Complex configurations that annotations cannot handle (composite keys, exact database indexing).

---

## 33. What is Grpc in .NET Core?

**Answer:**
gRPC is a high-performance Remote Procedure Call (RPC) framework using HTTP/2 and Protocol Buffers (Protobuf). It allows .NET Core apps to communicate via compressed, binary data.

**Use Cases:**
- Ideal for Microservice-to-Microservice backend communication where JSON REST is too slow and heavy.

**Pros & Cons:**
*   **Pros:** Extremely low latency, strict strongly typed contracts via `.proto` files.
*   **Cons:** Hard to read data blindly (binary), browser integration requires extra steps (gRPC-Web).

---

## 34. What are Tag Helpers?

**Answer:**
Tag Helpers enable server-side code to participate in creating and rendering HTML elements in Razor Views dynamically, behaving much like standard HTML tags.

**Example:**
```html
<a asp-controller="Home" asp-action="Index">Go to Home</a>
```

**Use Cases:**
- Replacing traditional HtmlHelpers (e.g., `@Html.ActionLink`) in Razor Pages/MVC for more readable HTML syntax.

---

## 35. What is the difference between `TempData`, `ViewData`, and `ViewBag`?

**Answer:**
- **`ViewData`:** A dictionary object passing data from Controller to View explicitly requiring casting. Lasts only the current request.
- **`ViewBag`:** A dynamic wrapper around `ViewData`. No casting is required, evaluated at runtime.
- **`TempData`:** Uses Session storage to persist data for exactly *one additional request* (e.g., redirecting to another action).

**Use Cases:**
- Passing validation success/error messages after submitting a form (`TempData`).
- Minor page titles/labels passed to the view `ViewBag.Title = "Home"`.

---

## 36. How do you implement logging in .NET Core (Serilog)?

**Answer:**
.NET Core has an `ILogger` abstraction. Serilog is a structured logging provider that overrides the default console logger to output semantic JSON data to sinks like Files, Elasticsearch, or Seq.

**Example:**
```csharp
builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day));
```

**Use Cases:**
- Deep observability and searching stack traces in log aggregation systems.

**Pros & Cons:**
*   **Pros:** Highly powerful structured data (`logger.Information("Checkout for {UserId}", user.Id)` keeps `UserId` as an indexed property).

---

## 37. What is Blazor?

**Answer:**
Blazor is a UI framework for building interactive client-side web UI with .NET/C# instead of JavaScript. It can run client-side in the browser via WebAssembly (WASM) or server-side via SignalR.

**Use Cases:**
- Companies with completely C#-centric developer pools wanting to build SPAs without learning React/Angular.

**Pros & Cons:**
*   **Pros:** Full stack C#, shared models between frontend and API.
*   **Cons:** WASM initial payload download is heavier than pure JS frameworks.

---

## 38. What is SignalR?

**Answer:**
An open-source library that simplifies adding real-time web functionality to apps. It automatically handles WebSocket negotiation, falling back to older techniques like Long Polling if necessary.

**Use Cases:**
- Chat applications, live stock market tickers, gaming leaderboards, real-time push notifications.

**Pros & Cons:**
*   **Pros:** Bi-directional communication without user refreshing, auto-reconnection logic.
*   **Cons:** Causes memory/scalability complexity; requires a backplane (like Azure SignalR or Redis) if load-balanced.

---

## 39. What is a "Record" type in C# / .NET?

**Answer:**
Introduced in C# 9, `record` is a reference type providing built-in encapsulation and immutability logic by default, along with value-equality (comparing by data rather than memory reference).

**Example:**
```csharp
public record User(int Id, string Name);
```

**Use Cases:**
- Creating immutable DTOs (Data Transfer Objects) and events in CQRS systems.

**Pros & Cons:**
*   **Pros:** Extremely concise one-line syntax, prevents accidental data mutation.
*   **Cons:** Should not be used for complex, heavily mutated objects (use `class` instead).

---

## 40. How does Garbage Collection (GC) work in .NET Core?

**Answer:**
The GC automatically manages application memory. When there is memory pressure on the Heap, the GC frees up memory allocated to objects no longer referenced by the application. It splits memory into Generations (Gen0, Gen1, Gen2) to optimize performance, cleaning short-lived objects entirely before touching long-lived ones.

---

## 41. What is Response Caching Middleware?

**Answer:**
Unlike memory caching (which stores arbitrary app data), Response Caching caches the final rendered HTTP Response. When a client requests the same URL, the server sends back the cached HTTP response instantly without running the controller logic.

**Example:**
`[ResponseCache(Duration = 60)]` added to a Controller action.

**Use Cases:**
- Heavy SQL-driven dashboards that don't need real-time data to be rendered constantly.

---

## 42. Explain the IHostedLifecycleService.

**Answer:**
Introduced in .NET 8, it inherits from `IHostedService` but provides much more granular lifecycle hooks: `StartingAsync`, `StartAsync`, `StartedAsync`, `StoppingAsync`, `StopAsync`, and `StoppedAsync`.

**Use Cases:**
- Performing highly sequential pre-flight dependencies checks before the Kestrel web server actually starts accepting traffic.

---

## 43. What is the significance of the `yield` keyword?

**Answer:**
`yield return` performs custom stateful iteration over a collection. Instead of allocating a whole list in memory and returning it, `yield` returns elements processing lazily, pausing execution until the next element is requested by the caller enumerating it.

**Use Cases:**
- Safely paginating or parsing through gigabytes of text file rows without freezing memory.

---

## 44. What are Tuples?

**Answer:**
Tuples provide concise syntax for returning multiple data elements from a single method call without needing to explicitly build wrapper `class` structures.

**Example:**
```csharp
public (int count, string status) GetData() {
    return (10, "Success");
}
// Caller: var (c, s) = GetData();
```

---

## 45. What is Shadow Properties in EF Core?

**Answer:**
Properties that exist strictly in the SQL database and EF Core Change Tracker, but aren't explicitly defined entirely inside the C# entity class.

**Use Cases:**
- Tracking automatic audit columns like `CreatedAt` and `LastModifiedBy` without cluttering the business domains.

---

## 46. What is the difference between Array, List, and Span<T>?

**Answer:**
- **Array:** Fixed contiguous size in memory.
- **List<T>:** Dynamically resizing array on the Heap.
- **`Span<T>`:** A highly optimized struct used to represent a contiguous region of arbitrary memory (stack or heap). It prevents allocations and GC pressure.

**Use Cases:**
- `Span`: High-performance parsing in Kestrel or text manipulation.

---

## 47. Explain IAsyncEnumerable.

**Answer:**
Combines async logic with iteration. It allows you to process streams of data asynchronously piece by piece. Data is awaited and yielded simultaneously.

**Example:**
```csharp
public async IAsyncEnumerable<int> GetNumbersAsync() {
    for (int i=0; i<10; i++) {
        await Task.Delay(100);
        yield return i;
    }
}
// Awaited using: await foreach(var num in GetNumbersAsync())
```

---

## 48. What is the problem with Over-Posting (Mass Assignment)?

**Answer:**
A security flaw where a client passes extra unexpected JSON parameters into a form submission. If the Entity Model is blindly passed in as an argument to the Controller and immediately `SaveChanges` via EF Core, a malicious user could pass `"IsAdmin": true`.

**Use Cases (Prevention):**
- Always map the request binding to explicit DTOs (Data Transfer Objects), and map the DTO properties strictly over to the Database Model using AutoMapper or manually.

---

## 49. How do you implement rate limiting in .NET 7/8?

**Answer:**
.NET includes built-in rate limiting middleware capable of managing client request spam via Sliding Window, Fixed Window, Concurrency limits, or Token Buckets.

**Example:**
```csharp
builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("Fixed", b => { b.PermitLimit = 10; b.Window = TimeSpan.FromMinutes(1); });
});
// Endpoint: [EnableRateLimiting("Fixed")]
```

**Use Cases:**
- Preventing DDoS attacks and API abuse by limiting API calls per IP to 10/minute.

---

## 50. What are C# Source Generators?

**Answer:**
A compiler feature that lets C# developers inspect user code, syntax trees, and metadata *during compilation*, and dynamically generate additional C# code files that are compiled alongside the project automatically.

**Use Cases:**
- Generating high-speed generic logging, mapping (e.g., Mapperly), DI registrations, or avoiding runtime Serialization reflections (System.Text.Json uses it in .NET 6+ to serialize models vastly faster).

**Pros & Cons:**
*   **Pros:** Shifts runtime reflection penalties completely over to compile time, massive performance boosts.
*   **Cons:** Extremely difficult to debug the compilation abstract syntax trees.
