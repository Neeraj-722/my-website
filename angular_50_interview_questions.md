# Comprehensive Angular Interview Guide

This guide contains detailed Angular interview questions complete with answers, examples, use cases, pros, and cons. 

## 1. What is the difference between Just-in-Time (JIT) and Ahead-of-Time (AOT) compilation?

**Answer:**
Angular provides two ways to compile your application:
- **JIT (Just-in-Time):** Compiles your app in the browser at runtime.
- **AOT (Ahead-of-Time):** Compiles your app at build time before downloading it to the browser.

**Example:**
Using Angular CLI:
- `ng build` (Uses AOT by default in Angular 9+)
- `ng build --aot=false` (Forces JIT)

**Use Cases:**
- **JIT:** Used during local development (historically) as it provides faster build times when frequently saving changes.
- **AOT:** Used for production deployments to ensure optimal performance and security.

**Pros & Cons:**
*   **AOT Pros:** Faster rendering in browser, smaller Angular framework download size (compiler is left out), early template error detection during build, better security (less injection attacks).
*   **AOT Cons:** Slower build time on the CI/CD pipeline or local machine.
*   **JIT Pros:** Extremely fast local build/rebuild times.
*   **JIT Cons:** Larger payload size (requires the Angular compiler), slower initial page load in the browser.

---

## 2. Observables vs Promises in Angular. What are the differences?

**Answer:**
Both handle asynchronous operations, but RxJS Observables are more powerful and heavily integrated into Angular (e.g., `HttpClient`, `EventEmitter`).

**Example:**
```typescript
// Promise
const myPromise = new Promise(resolve => {
  setTimeout(() => resolve('Promise resolved!'), 1000);
});
myPromise.then(res => console.log(res));

// Observable
import { Observable } from 'rxjs';
const myObservable = new Observable(observer => {
  setTimeout(() => {
    observer.next('Observable emitted 1!');
    observer.next('Observable emitted 2!'); // Can emit multiple values
  }, 1000);
});
const sub = myObservable.subscribe(res => console.log(res));
sub.unsubscribe(); // Can be cancelled
```

**Use Cases:**
- **Promises:** Simple, single-event async operations (like native `fetch`). Minimum setup.
- **Observables:** Handling streams of data like web sockets, user input events (typeahead search), and repeating HTTP requests.

**Pros & Cons:**
*   **Observables Pros:** Can emit multiple values over time, can be cancelled (`unsubscribe()`), support powerful operators (`map`, `filter`, `switchMap`), are lazy (don't execute until subscribed).
*   **Observables Cons:** Steeper learning curve, requires RxJS library, can cause memory leaks if not unsubscribed.
*   **Promises Pros:** Native to JavaScript, simpler to understand, easier to chain with `async/await`.
*   **Promises Cons:** Cannot be cancelled, only emit a single value, execute immediately upon creation (eager).

---

## 3. Explain the difference between Subject, BehaviorSubject, and ReplaySubject in RxJS.

**Answer:**
All three are types of Observables that allow multicasting values to multiple Observers.
- **Subject:** Does not store the current value. Late subscribers will not get values emitted before they subscribed.
- **BehaviorSubject:** Stores the *latest* value. Late subscribers immediately get the latest value upon subscription. It requires an initial value.
- **ReplaySubject:** Stores a *specified number* of past values (or all of them) and replays them to new subscribers.

**Example:**
```typescript
// BehaviorSubject Example
const bSubject = new BehaviorSubject<number>(0); // Requires initial value
bSubject.subscribe(val => console.log('Sub A:', val)); // Prints 0
bSubject.next(1); // Prints 1
bSubject.subscribe(val => console.log('Sub B:', val)); // Instantly prints 1
```

**Use Cases:**
- **Subject:** Event buses where past events don't matter (e.g., a "save clicked" event).
- **BehaviorSubject:** State management (e.g., current logged-in user, current theme). You always want to know the *current* state.
- **ReplaySubject:** Caching HTTP responses or caching a history of actions (e.g., a chat history).

**Pros & Cons:**
*   **BehaviorSubject Pros:** Perfect for global state, guarantees a value is always available synchronously via `.getValue()`.
*   **BehaviorSubject Cons:** Requires an initial value, which might not always make sense (e.g., null checking).
*   **ReplaySubject Pros:** Great for caching multiple historical states.
*   **ReplaySubject Cons:** Can cause memory issues if the buffer size is set too large.

---

## 4. What are Route Guards in Angular and name the different types?

**Answer:**
Route Guards are interfaces that tell the router whether or not it should allow navigation to a requested route. They are primarily used for authorization and authentication.

**Types:**
1.  `CanActivate`: Checks if a user can visit a route.
2.  `CanActivateChild`: Checks if a user can visit a route's children.
3.  `CanDeactivate`: Checks if a user can leave a route (useful for unsaved changes).
4.  `Resolve`: Pre-fetches data before navigating to a route.
5.  `CanLoad` / `CanMatch`: Checks if a module can be lazy-loaded.

**Example:**
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/login');
};

// In routing module:
{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
```

**Use Cases:**
- Preventing unauthenticated users from accessing administrative pages.
- Warning a user they have unsaved form data before navigating away (`CanDeactivate`).

**Pros & Cons:**
*   **Pros:** Centralized security logic, prevents loading components unnecessarily, clean architecture.
*   **Cons:** Can make routing complex to debug if multiple guards depend on async operations.

---

## 5. What are Angular Interceptors? Can you provide a use case?

**Answer:**
Interceptors (`HttpInterceptor`) sit between your application and the backend. They allow you to inspect, transform, and manipulate outgoing HTTP requests and incoming HTTP responses globally.

**Example:**
```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and add the authorization header
  const authReq = req.clone({
    headers: req.headers.set('Authorization', 'Bearer my-auth-token')
  });
  
  // Pass the cloned request to the next handler
  return next(authReq);
};
```

**Use Cases:**
- Attaching JWT (Auth) tokens to every outgoing request.
- Global error handling (catching 401 Unauthorized errors and redirecting to login).
- Adding global loading spinners when a request starts and stopping them when it ends.
- Logging HTTP request durations.

**Pros & Cons:**
*   **Pros:** Eliminates boilerplate code (no need to add headers in every service), creates a single source of truth for request configuration.
*   **Cons:** If not structured properly, a badly written interceptor can break all HTTP calls in the entire application.

---

## 6. What is the difference between Reactive Forms and Template-Driven Forms?

**Answer:**
Angular provides two approaches to handling forms:
- **Template-Driven Forms:** Logic entirely lives in the HTML template using directives like `ngModel`. Angular automatically creates the form model under the hood.
- **Reactive Forms:** Form logic, validation, and structure are defined in the TypeScript component class using `FormControl`, `FormGroup`, and `FormBuilder`. The template simply binds to these objects.

**Example (Reactive Forms):**
```typescript
// Component
loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', Validators.required)
});

// Template
<form [formGroup]="loginForm">
  <input formControlName="email">
</form>
```

**Use Cases:**
- **Template-Driven:** Simple forms with basic validation (e.g., a simple email signup field).
- **Reactive:** Complex forms, dynamic forms (adding/removing fields at runtime), forms requiring custom synchronous/asynchronous validation, testing form logic without rendering the UI.

**Pros & Cons:**
*   **Reactive Pros:** Highly testable (no DOM required), scalable, predictable (immutable data model), supports complex custom validation easily.
*   **Reactive Cons:** More boilerplate code required in the component.
*   **Template-Driven Pros:** Very easy to learn, quick setup for simple forms.
*   **Template-Driven Cons:** Harder to test, validations are restricted to HTML attributes or custom directives, less scalable.

---

## 7. Explain Change Detection Strategies in Angular (Default vs OnPush).

**Answer:**
Change Detection is how Angular synchronizes the component state with the DOM.
- **Default Strategy:** Angular checks *every component* in the component tree from top to bottom every time an event occurs (click, timer, HTTP response).
- **OnPush Strategy:** Angular only checks the component if arguably one of three things happens: 
  1. An `@Input()` reference changes.
  2. An event originates from the component or its children.
  3. You manually trigger change detection using `ChangeDetectorRef.markForCheck()`.

**Example:**
```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  template: `<h1>{{ user.name }}</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush // Optimization!
})
export class UserProfileComponent {
  @Input() user: any;
}
```

**Use Cases:**
- **Default:** Used for most simple applications where performance isn't an immediate concern.
- **OnPush:** Used for complex dashboards, applications rendering large lists, or highly nested component trees to maximize UI performance.

**Pros & Cons:**
*   **OnPush Pros:** Drastically improves performance by skipping unnecessary DOM checks.
*   **OnPush Cons:** Requires a strict adherence to **immutable data structures**. If you mutate an object property instead of replacing the object reference, the UI will not update, causing confusing bugs.

---

## 8. What is the difference between ViewChild and ContentChild?

**Answer:**
Both are decorators used to query the DOM inside a component to get a reference to elements or child components.
- **@ViewChild:** Queries the component's *own* template URL/HTML file.
- **@ContentChild:** Queries the projected content that is passed *into* the component from a parent (content placed between the component's opening and closing tags using `<ng-content>`).

**Example:**
```typescript
// Child Component
@Component({
  selector: 'app-tab',
  template: `
    <h1 #titleRef>My Title</h1> <!-- Accessed via ViewChild -->
    <ng-content></ng-content> <!-- Content passed here accessed via ContentChild -->
  `
})
export class TabComponent {
  @ViewChild('titleRef') title!: ElementRef;
  @ContentChild(CustomWidgetComponent) widget!: CustomWidgetComponent;
}

// Parent Component HTML
<app-tab>
  <app-custom-widget></app-custom-widget> <!-- The projected content -->
</app-tab>
```

**Use Cases:**
- **ViewChild:** Needing to set focus on an input field inside your own component, or calling a method on a child component you explicitly placed in your template.
- **ContentChild:** Building wrapper components (like Modals, Accordions, Tabs) that need to deeply inspect or modify the generic content passed into them by developers.

**Pros & Cons:**
*   **Pros:** Allows direct DOM manipulation safely using `ElementRef` and direct component API calls.
*   **Cons:** Heavy use of ViewChild/ContentChild can tightly couple components together, violating the principle of encapsulation.

---

## 9. Explain ng-template, ng-container, and ng-content.

**Answer:**
- **`ng-template`:** Holds template structure but does not render anything to the DOM until explicitly instantiated (often using `*ngIf` or `*ngTemplateOutlet`).
- **`ng-container`:** A logical grouping element that does *not* add an extra HTML tag to the DOM. Perfect for using structural directives without adding unnecessary `<div>` or `<span>` tags.
- **`ng-content`:** Used to project content dynamically into a component (Content Projection / Transclusion).

**Example:**
```html
<!-- ng-container to group without adding DOM elements -->
<ng-container *ngIf="isLoggedIn; else loginTmpl">
  <p>Welcome back, user!</p>
</ng-container>

<!-- ng-template definition -->
<ng-template #loginTmpl>
  <p>Please log in.</p>
</ng-template>

<!-- ng-content inside of app-card -->
<div class="card">
  <ng-content select="header"></ng-content>
  <ng-content></ng-content> <!-- Default projection -->
</div>
```

**Use Cases:**
- **`ng-container`:** Using `*ngIf` and `*ngFor` on the same level (Angular doesn't allow two structural directives on one element).
- **`ng-template`:** Defining reusable UI snippets or fallback states (like loading spinners).
- **`ng-content`:** Creating highly reusable UI components like Cards, Modals, and Layout wrappers.

---

## 10. What are Pure vs Impure Pipes?

**Answer:**
A Pipe takes in data as input and transforms it to a desired format in the template (e.g., `{{ date | date:'short' }}`).
- **Pure Pipe (Default):** Angular executes a pure pipe *only* when it detects a pure change to the input value (Primitive changes like String/Number, or Object *Reference* changes). It does not execute if an object property is mutated. 
- **Impure Pipe:** Angular executes an impure pipe during *every single component change detection cycle*, regardless of whether the input changed.

**Example:**
```typescript
@Pipe({
  name: 'sortList',
  pure: false // Makes it an impure pipe
})
export class SortListPipe implements PipeTransform {
  transform(array: any[]): any[] {
    return array.sort();
  }
}
```

**Use Cases:**
- **Pure Pipes:** Formatting strings, currencies, dates, mathematical calculations.
- **Impure Pipes:** Sorting/filtering arrays where items might be pushed/popped without changing the array reference. Also used by `AsyncPipe` to constantly monitor Observable streams.

**Pros & Cons:**
*   **Pure Pros:** Highly performant, heavily cached by Angular.
*   **Pure Cons:** Will not update if you mutate an array/object instead of replacing it.
*   **Impure Cons:** Horrible for performance. If an impure pipe has heavy logic (like a slow API call or complex sorting), it will freeze the application because it runs constantly.

---

## 11. What is the Async Pipe and why is it recommended?

**Answer:**
The `AsyncPipe` subscribes to an `Observable` or `Promise` directly in the HTML template and returns the latest value emitted. 

**Example:**
```typescript
// Component
user$ = this.userService.getUserData(); // Returns Observable

// Template
<div *ngIf="user$ | async as user">
  <h1>{{ user.name }}</h1>
</div>
```

**Use Cases:**
- Rendering HTTP responses, rendering state from NgRx/BehaviorSubjects.

**Pros & Cons:**
*   **Pros:** Prevents memory leaks by automatically calling `unsubscribe()` when the component is destroyed. It also flags the component for Change Detection automatically, making it perfect for `OnPush` change detection strategies. Leaves component code very clean.
*   **Cons:** Can be trickier to debug since the subscription logic is hidden in the template.

---

## 12. Explain trackBy in *ngFor and why it's used.

**Answer:**
By default, when an array changes (items are added, removed, or the array is reassigned), Angular tears down the entire DOM tree for that list and rebuilds it. This is computationally expensive. `trackBy` allows you to tell Angular how to uniquely identify items in an array so it only updates the exact DOM element that changed.

**Example:**
```html
<li *ngFor="let item of items; trackBy: trackByFn">
  {{ item.id }} - {{ item.name }}
</li>
```
```typescript
trackByFn(index: number, item: any): number {
  return item.id; // Unique identifier
}
```

**Use Cases:**
- Rendering large lists of data from API polling.
- Data grids, infinite scrolling feeds.

**Pros & Cons:**
*   **Pros:** Massive performance gains on large DOM lists.
*   **Cons:** Mild boilerplate required for every list.

---

## 13. What is the difference between ElementRef and Renderer2?

**Answer:**
Both are used for directly manipulating the DOM.
- **ElementRef:** Provides direct access to the native DOM element via `.nativeElement`.
- **Renderer2:** An abstraction layer provided by Angular to manipulate the DOM safely.

**Example:**
```typescript
constructor(private el: ElementRef, private renderer: Renderer2) {}

ngAfterViewInit() {
  // Bad practice: Direct DOM access
  this.el.nativeElement.style.color = 'red'; 

  // Good practice: Abstracted DOM access
  this.renderer.setStyle(this.el.nativeElement, 'color', 'blue');
}
```

**Use Cases:**
- Creating custom structural and attribute directives that need to change element styles or append children.

**Pros & Cons:**
*   **Renderer2 Pros:** Secure against Cross-Site Scripting (XSS) attacks. Supports rendering outside the browser environment (e.g., Angular Universal for Server-Side Rendering or Web Workers).
*   **ElementRef Cons:** Direct injection represents a security vulnerability and breaks Server-Side Rendering because the server environment (Node.js) does not have a `window` or `document` object.

---

## 14. What is Lazy Loading in Angular?

**Answer:**
Lazy loading is the process of loading NgModules or Standalone Components *only when the user navigates directly to their route*, rather than loading the entire application's code on the initial load.

**Example:**
```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];
```

**Use Cases:**
- Splitting a massive enterprise application. e.g., A normal user never needs the administrative panel code, so lazy load the `admin` route.

**Pros & Cons:**
*   **Pros:** Drastically reduces the initial bundle size (`main.js`), resulting in incredibly fast initial loading speeds.
*   **Cons:** Adds a slight delay when the user clicks the lazily-loaded route for the first time while the browser fetches the secondary chunk. (This is generally mitigated by using Preloading Strategies).

---

## 15. What are Angular Standalone Components?

**Answer:**
Introduced in Angular 14 as a developer preview and made stable in Angular 15, Standalone Components allow developers to build Angular applications *without* using `NgModules`. They specify their own dependencies directly via the `imports` array in the `@Component` decorator.

**Example:**
```typescript
@Component({
  selector: 'app-hello',
  standalone: true, // Key property
  imports: [CommonModule, FormsModule], // Import dependencies directly here
  template: `<h1>Hello World</h1>`
})
export class HelloComponent {}
```

**Use Cases:**
- Default modern Angular development.
- Building very small, self-contained micro-frontends or web components.

**Pros & Cons:**
*   **Pros:** Significantly reduces boilerplate code, easier learning curve for beginners (no need to understand complex Module concepts), easier to lazily load single components.
*   **Cons:** Migrating massive, legacy `NgModule`-based applications to Standalone can be tedious, though Angular CLI provides automated migration schematics.
*   **Cons:** Migrating massive, legacy `NgModule`-based applications to Standalone can be tedious, though Angular CLI provides automated migration schematics.

---

## 16. What are the different types of Data Binding in Angular?

**Answer:**
Data binding allows communication between the component class and its HTML template.
1.  **Interpolation (`{{ value }}`):** One-way binding from component to DOM.
2.  **Property Binding (`[property]="value"`):** One-way binding from component to DOM property.
3.  **Event Binding (`(event)="handler()"`):** One-way binding from DOM to component.
4.  **Two-Way Binding (`[(ngModel)]="value"`):** Binds data from component to DOM and listens for DOM events to update the component simultaneously.

**Example:**
```html
<h1>{{ title }}</h1> <!-- Interpolation -->
<button [disabled]="isInvalid">Submit</button> <!-- Property -->
<button (click)="onSubmit()">Click Me</button> <!-- Event -->
<input [(ngModel)]="username"> <!-- Two-Way -->
```

**Use Cases:**
- **Property:** Dynamically styling elements, enabling/disabling forms.
- **Two-way:** Standard data entry forms where the component must reflect the exact state of what the user is typing.

**Pros & Cons:**
*   **Two-way Pros:** Easiest way to build simple forms and synchronize data.
*   **Two-way Cons:** Can cause performance constraints if used heavily on massive lists. Reactive forms (which lean on one-way data flow) are preferred for complex scenarios.

---

## 17. Explain Angular Lifecycle Hooks. What is their order of execution?

**Answer:**
Lifecycle hooks are methods that allow you to tap into key events in a component's lifecycle, from creation to destruction.
Order of execution:
1.  `ngOnChanges`: When an `@Input()` property changes.
2.  `ngOnInit`: Once, after the first `ngOnChanges`. Component initialization.
3.  `ngDoCheck`: During every change detection run.
4.  `ngAfterContentInit`: Once, after projected content (`<ng-content>`) is initialized.
5.  `ngAfterContentChecked`: After projected content is checked.
6.  `ngAfterViewInit`: Once, after component's views/child views are initialized.
7.  `ngAfterViewChecked`: After views/child views are checked.
8.  `ngOnDestroy`: Right before the component is destroyed.

**Example:**
```typescript
export class ExampleComponent implements OnInit, OnDestroy {
  ngOnInit() {
    console.log('Component Initialized! Great for HTTP calls.');
  }
  ngOnDestroy() {
    console.log('Component is dying! Unsubscribe from Observables here.');
  }
}
```

**Use Cases:**
- **`ngOnInit`:** API calls to fetch data.
- **`ngOnDestroy`:** Memory management (unsubscribing from RxJS streams to prevent memory leaks).

**Pros & Cons:**
*   **Pros:** Gives fine-grained control over component behavior.
*   **Cons:** Overusing hooks like `ngDoCheck` or `ngAfterViewChecked` can severely impact performance since they run hundreds of times during normal user interaction.

---

## 18. What is the difference between @HostBinding() and @HostListener()?

**Answer:**
Both are decorators used within directives (and occasionally components) to interact with the host HTML element the directive is attached to.
- **`@HostBinding()`:** Binds a host element property (like `class`, `style`, or `value`) to a property in your directive/component class.
- **`@HostListener()`:** Listens to an event on the host element (like `click`, `mouseenter`) and triggers a method in your class.

**Example:**
```typescript
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  // Binds the 'style.backgroundColor' of the host element
  @HostBinding('style.backgroundColor') bg = 'transparent';

  // Listens to the 'mouseenter' event of the host element
  @HostListener('mouseenter') onMouseEnter() {
    this.bg = 'yellow';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.bg = 'transparent';
  }
}
```

**Use Cases:**
- Creating custom structural UI directives like tooltips, dropdown toggles, or drag-and-drop zones.

**Pros & Cons:**
*   **Pros:** Keeps directive code perfectly encapsulated without needing to manually query the DOM or manage event listeners using raw JavaScript.

---

## 19. Explain View Encapsulation in Angular.

**Answer:**
View Encapsulation determines how CSS styles are applied to a component. Angular provides three strategies:
1.  **`Emulated` (Default):** Styles are scoped *only* to the component. Angular achieves this by adding unique attributes (like `_ngcontent-c1`) to elements and appending them to the CSS selectors.
2.  **`None`:** Styles are applied globally to the entire document. If you put `p { color: red }` in this component, all paragraphs in the entire app turn red.
3.  **`ShadowDom`:** Uses the browser's native Shadow DOM API to encapsulate styles. 

**Example:**
```typescript
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  encapsulation: ViewEncapsulation.None // Styles will bleed out globally!
})
```

**Use Cases:**
- **`Emulated`:** Standard component styling.
- **`None`:** Usually avoided, but sometimes used in an overarching `AppModule` or layout component to override external library styles (like a third-party modal).

**Pros & Cons:**
*   **Emulated Pros:** Safe, modular CSS without naming collisions.
*   **ShadowDom Cons:** Not fully supported on severely outdated browsers.

---

## 20. What is Dependency Injection (DI) and how does Angular's Hierarchical Injector work?

**Answer:**
DI is a design pattern where a class receives its dependencies from an external source rather than creating them itself. Angular has its own DI framework.
Angular's injectors are hierarchical, matching the component tree:
1.  **Module/Environment Level:** Services `providedIn: 'root'` are singletons shared across the entire app.
2.  **Component Level:** If a component provides a service directly in its `@Component({ providers: [MyService] })` array, it gets a completely *new, isolated instance* of that service, shared only with its children.

**Example:**
```typescript
@Injectable({
  providedIn: 'root' // Singleton across the entire application
})
export class GlobalApiService {}

@Component({
  selector: 'app-child',
  providers: [LocalTaskService] // New instance created every time this component renders
})
export class ChildComponent {}
```

**Use Cases:**
- `root`: Authentication services, HTTP API services, global state.
- `providers: []`: A form service used to manage state for a specific wizard component. If you have 3 wizards open, they need 3 separate state instances.

**Pros & Cons:**
*   **Pros:** Highly testable code, singletons reduce memory consumption, strict separation of concerns.

---

## 21. What is the difference between `constructor` and `ngOnInit`?

**Answer:**
- **`constructor`:** A default TypeScript feature used strictly for instantiating the class and injecting dependencies. Angular's data bindings (`@Input()`) are **not yet available** in the constructor.
- **`ngOnInit`:** An Angular lifecycle hook called *after* the constructor and *after* the component's `@Input()` properties have been initialized with data from the parent.

**Example:**
```typescript
export class UserProfile {
  @Input() userId!: number;

  constructor() {
    console.log(this.userId); // Prints 'undefined' ! Data isn't here yet.
  }

  ngOnInit() {
    console.log(this.userId); // Prints the actual ID passed from parent.
  }
}
```

**Use Cases:**
- **Constructor:** `constructor(private http: HttpClient) {}`
- **ngOnInit:** Firing off the HTTP request to load data for the component.

**Pros & Cons:**
*   **Constructor Cons for Logic:** Doing heavy work in the constructor makes the component incredibly hard to unit test.

---

## 22. What are Angular Resolvers and why use them?

**Answer:**
A Resolver is an interface (`Resolve<T>`) used during routing. It runs a task typically async, like an HTTP request, and *blocks the route transition* until the data resolves. The component is only loaded once the data is ready.

**Example:**
```typescript
// Resolver Function
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getUser(route.paramMap.get('id'));
};

// Routing module
{
  path: 'user/:id',
  component: UserComponent,
  resolve: { userData: userResolver } // Blocks routing until fetched
}

// User Component
ngOnInit() {
  this.user = this.route.snapshot.data['userData'];
}
```

**Use Cases:**
- Ensuring the user doesn't see a "blank" UI with a loading spinner. Instead, they wait on the previous page, and when the new page loads, it's fully populated.

**Pros & Cons:**
*   **Pros:** Prevents empty layout flashes, simplifies component logic (data is guaranteed to exist).
*   **Cons:** If the API takes 5 seconds, the UI looks "frozen" because the route transition is blocked. (You must add a global routing loading bar).

---

## 23. Explain Content Projection (`<ng-content>`) and its types.

**Answer:**
Content projection allows you to insert, or project, HTML content coming from a parent component into child components.
- **Single-slot projection:** A single `<ng-content>` tag catches all projected HTML.
- **Multi-slot projection:** Multiple `<ng-content select="[directive]">` tags target specific HTML elements.

**Example:**
```html
<!-- Child Component (CardComponent) -->
<div class="card-wrapper">
  <div class="header">
    <ng-content select="[card-title]"></ng-content>
  </div>
  <div class="body">
    <ng-content></ng-content> <!-- Catch-all -->
  </div>
</div>

<!-- Parent Component -->
<app-card>
  <h1 card-title>Hello World</h1>
  <p>This goes to the strictly body area.</p>
</app-card>
```

**Use Cases:**
- Modals, Accordions, Tabs, and custom UI framework elements.

**Pros & Cons:**
*   **Pros:** Creates highly dynamic, reusable UI elements.

---

## 24. What are HttpInterceptors and how do you handle JWT Tokens?

**Answer:**
Interceptors intercept incoming or outgoing HTTP requests. For JWT tokens, the interceptor grabs the token from `localStorage` or a service, clones the `HttpRequest`, and attaches the token to the `Authorization` header.

**Example:**
```typescript
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(request);
  }
}
```

**Use Cases:**
- Attaching auth tokens, appending tenant IDs, global API error handling (401 redirects).

---

## 25. What is the difference between `forRoot` and `forChild`?

**Answer:**
These are static methods used to configure `NgModules`. 
- **`forRoot`:** Used *only* in the root `AppModule`. It configures the module and creates **singleton services** for the entire application.
- **`forChild`:** Used in lazily-loaded feature modules. It configures the module without registering the services (because registering them again would create a second instance of the service, breaking the singleton pattern).

**Example:**
```typescript
// App Module
imports: [RouterModule.forRoot(routes)] // registers the Router service

// Feature Module
imports: [RouterModule.forChild(featureRoutes)] // registers routes, uses existing Router service
```

**Use Cases:**
- Providing routing configurations, configuring third-party libraries (e.g., `StoreModule.forRoot()` in NgRx).

**Pros & Cons:**
*   **Pros:** Prevents accidental instantiation of duplicate services when lazy loading modules.

---

## 26. How do you implement global error handling in Angular?

**Answer:**
You implement Angular's `ErrorHandler` interface and provide it globally to catch any unhandled exceptions occurring in the application.

**Example:**
```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Caught by Global Error Handler: ', error);
    // Send to Datadog / Sentry here
  }
}

// In AppModule/Config:
providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }]
```

**Use Cases:**
- Logging front-end crashes to third-party tracking services (Sentry, Datadog, Application Insights).
- Showing a user-friendly "Something went wrong" toast notification.

---

## 27. What is Angular Universal (Server-Side Rendering)?

**Answer:**
Normally, Angular executes entirely in the browser (Client-Side Rendering). Angular Universal executes the Angular application on a Node.js Express server. The server generates static HTML pages and sends them to the browser, then Angular "hydrates" the DOM to make it interactive.

**Use Cases:**
- **SEO Optimization:** Search engine web crawlers can read the fully-formed HTML immediately.
- **Initial Load Performance:** Improves FCP (First Contentful Paint) dramatically on slow mobile connections.

**Pros & Cons:**
*   **Pros:** Massive SEO benefits.
*   **Cons:** Extremely complex to set up and manage. Requires removing all direct DOM manipulations (`window`, `document`) as Node.js has no browser window API.

---

## 28. What are Service Workers and PWAs in Angular?

**Answer:**
A Progressive Web App (PWA) behaves like a native mobile app. Angular provides the `@angular/pwa` package which utilizes Service Workers. A Service Worker acts as a network proxy running in the background.

**Use Cases:**
- **Offline Mode:** Intercepts HTTP requests and serves cached static assets (HTML/JS/CSS) even if the user has no internet connection.
- **Push Notifications:** Receives push notifications from the backend when the browser is closed.

**Pros & Cons:**
*   **Pros:** App is installable on mobile devices, Lightning-fast loading from cache.
*   **Cons:** Caching logic can be notoriously difficult to debug, resulting in users seeing stale versions of the application.

---

## 29. What is NgRx and how does the State Management pattern work?

**Answer:**
NgRx is a Redux-inspired state management library for Angular. It uses RxJS Observables to manage application state predictably.
Concepts:
- **Store:** The single source of truth database for the UI.
- **Actions:** Unique events dispatched by components (e.g., `[Login Page] Login Clicked`).
- **Reducers:** Pure functions that take the current state and the Action, and return the *new* state.
- **Selectors:** RxJS observables that components subscribe to in order to read slices of the state.
- **Effects:** Handle side-effects like HTTP calls asynchronously.

**Use Cases:**
- Massive enterprise applications with complex, shared state (e.g., shopping carts, dashboard data shared across 10 components).

**Pros & Cons:**
*   **Pros:** Insanely predictable, incredible debugging (Redux DevTools time-traveling).
*   **Cons:** Immense boilerplate code (literally 5 files needed to make one API call stream). Overkill for small apps.

---

## 30. How do you optimize an Angular Application's performance?

**Answer:**
1.  **AOT Compilation & Production Builds** (`ng build`)
2.  **Lazy Loading:** Split the app into distinct modules so the initial bundle size is small.
3.  **OnPush Change Detection:** Stop Angular from checking every component on every UI event.
4.  **`trackBy` in `*ngFor`:** Prevents expensive DOM teardows on array changes.
5.  **Pure Pipes:** Over functions in templates. Calling `{{ calculateValue() }}` in HTML runs it hundreds of times. Use `{{ value | calculate }}` instead.
6.  **Unsubscribe from Observables:** To prevent memory leaks (`takeUntilDestroyed()`).

**Pros & Cons:**
*   **Pros:** Faster load times, higher Lighthouse scores, less lag during interactions.

---

## 31. Explain HTTPClient vs Fetch API.

**Answer:**
While `fetch()` is a native JavaScript promise-based API, `HttpClient` is Angular's built-in wrapper.
`HttpClient`:
- Uses RxJS Observables instead of Promises.
- Can be cancelled (`subscription.unsubscribe()`).
- Supports strongly typed requests/responses (`http.get<User>()`).
- Built-in JSON parsing (no need for `res.json()`).
- Interceptor support.
- Progress events for file uploads.

**Use Cases:**
- Always use `HttpClient` within Angular projects. Never bypass it with `fetch()` as you lose interceptor capabilities.

---

## 32. What is the difference between `mergeMap`, `switchMap`, `concatMap`, and `exhaustMap`?

**Answer:**
These are RxJS mapping operators used heavily with Angular HTTP calls.
- **`mergeMap`:** Subscribes to observables in parallel. Does not care about order.
- **`switchMap`:** Cancels the previous observable if a new one arrives. (Perfect for Typeahead/Search bars to cancel old autocomplete requests).
- **`concatMap`:** Queues observables one by one sequentially. (Perfect for strict sequencing, like saving form segments).
- **`exhaustMap`:** Ignores new incoming requests if the current one is still running. (Perfect for a "Submit" button to prevent double-saving).

---

## 33. What are Angular Structural vs Attribute Directives?

**Answer:**
- **Structural Directives:** Change the DOM layout by adding and removing DOM elements. They are prefixed with an asterisk `*`. Examples: `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Attribute Directives:** Change the appearance or behavior of an existing DOM element. Examples: `ngClass`, `ngStyle`, `[(ngModel)]`.

**Example:**
```html
<div *ngIf="show">Structural: I remove the div if false</div>
<div [ngClass]="{'active': show}">Attribute: I just toggle CSS classes</div>
```

---

## 34. How does Angular handle Environment Variables?

**Answer:**
Angular uses environment configuration files located in the `src/environments/` folder (traditionally `environment.ts` and `environment.deployment.ts`). You access them directly via import. At build time, Angular CLI swaps the files using file replacements configured in `angular.json`.

**Example:**
```typescript
import { environment } from '../environments/environment';

export class ApiService {
  apiUrl = environment.apiUrl; // Will dynamically be localhost or production URL
}
```

---

## 35. Explain the difference between Component, Module, and Directive.

**Answer:**
- **Component:** The fundamental UI block. A class with an `@Component` decorator, featuring an HTML template and CSS styles. Technically, a component is just a Directive with a template.
- **Directive:** A class with an `@Directive` decorator that adds behavior to an existing element in the DOM (no HTML template of its own).
- **Module:** A class with an `@NgModule` decorator used to conceptually group related Components, Directives, Pipes, and Services together, acting as a cohesive block of functionality.

---

## 36. How does Angular protect against Cross-Site Scripting (XSS)?

**Answer:**
Angular inherently treats all values as untrusted by default. When a value is inserted into the DOM via interpolation, property, attribute, style, or class binding, Angular automatically *sanitizes* it and escapes potentially dangerous characters `<script>`.

**Example:**
If an API returns `"<script>alert('Hacked')</script>"`, Angular will output the string literally, rather than executing the script.

**Use Cases:**
- Taking user input from a rich text editor and binding it to `[innerHTML]`.

**Pros & Cons:**
*   **Pros:** Secure by default.
*   **Cons:** Sometimes you intentionally *want* to render safe HTML/Iframes, requiring you to manually bypass the security.

---

## 37. How do you bypass Angular's built-in security?

**Answer:**
You use the `DomSanitizer` service and its bypass methods.

**Example:**
```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export class HtmlComponent {
  safeHtml: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {
    const rawHtmlStr = '<iframe src="https://youtube.com/..."></iframe>';
    // Marks the string as explicitly safe to render as a URL
    this.safeHtml = this.sanitizer.bypassSecurityTrustResourceUrl(rawHtmlStr); 
  }
}
```

**Use Cases:**
- Rendering YouTube IFrames, dynamic SVG files, or rich text editors explicitly trusted by the backend.

---

## 38. Explain Sync vs Async Custom Form Validators.

**Answer:**
- **Sync Validators:** Functions that take a control instance and immediately return either a set of validation errors or `null`.
- **Async Validators:** Functions that return a `Promise` or an `Observable` that later emits a set of validation errors or `null`.

**Example (Async):**
```typescript
static emailTakenValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return userService.checkEmailExists(control.value).pipe(
      map(isTaken => (isTaken ? { emailTaken: true } : null)),
      catchError(() => of(null))
    );
  };
}
```

**Use Cases:**
- You use an Async validator when you must ping a backend database (e.g., "Is this username already taken?") before determining if the form field is valid.

---

## 39. What is the APP_INITIALIZER token?

**Answer:**
It is a built-in injection token invoked exactly when the Angular application boots up. It allows you to execute a function (like an HTTP call) and *halts the application's initialization* until that Promise resolves.

**Example:**
```typescript
providers: [
  {
    provide: APP_INITIALIZER,
    useFactory: (configService: ConfigService) => () => configService.loadEnvVariables(),
    deps: [ConfigService],
    multi: true
  }
]
```

**Use Cases:**
- Fetching deep configuration settings, feature flags, or loading critical user session data from an API *before* the first component even renders.

---

## 40. Describe the difference between ViewEngine and Ivy Compiler.

**Answer:**
- **ViewEngine:** The default compiler used prior to Angular 9. It was functional but created massive bundle sizes.
- **Ivy:** The completely rewritten rendering engine default in Angular 9+. It compiles components much closer to standard DOM manipulation instructions.

**Use Cases (Why Ivy is better):**
- **Tree-shaking:** Ivy only bundles the exact parts of Angular you actually use.
- **Lazy Loading:** Enabled component-level lazy loading without NgModules.
- **Debugging:** Introduced better template type-checking and the global `ng` browser debugging object.

---

## 41. What are Angular Signals? (Angular 16+)

**Answer:**
Signals are a new reactive primitive introduced in Angular 16 to eventually replace `RxJS` for local synchronous state management, and heavily reduce reliance on `Zone.js` for change detection.
A Signal is a wrapper around a value that automatically notifies consumers when it changes.

**Example:**
```typescript
import { signal, computed, effect } from '@angular/core';

count = signal(0); // Create signal
doubleCount = computed(() => this.count() * 2); // Derived signal

increment() {
  this.count.update(c => c + 1);
}
```

**Use Cases:**
- Modern synchronous state management and fine-grained reactivity.
**Pros & Cons:**
*   **Pros:** Glitch-free execution, highly readable (no `.subscribe()`), allows Angular to update specific DOM nodes rather than checking the whole component tree.

---

## 42. Explain pseudo-class selectors: `:host`, `:host-context`, and `::ng-deep`.

**Answer:**
These are CSS selectors used specifically in Angular components.
- **`:host`:** Targets the host element of the component itself (the custom tag, e.g., `<app-card>`), not just the elements *inside* its template.
- **`:host-context(.dark-theme)`:** Targets the host component *only if* it or any of its ancestors has the `.dark-theme` CSS class.
- **`::ng-deep` (Deprecated):** Disables view encapsulation for a specific CSS rule, allowing the style to bleed down into all child components.

**Use Cases:**
- `ng-deep` is heavily used when a developer is forced to override the CSS of a pre-built UI library component (like Angular Material).

---

## 43. How do you share data between two completely unrelated components?

**Answer:**
If components do not share a parent-child relationship (so `@Input` and `@Output` won't work), you use a **Shared Service**.
You create an Injectable service containing an RxJS `BehaviorSubject`. Both components inject the service; one component calls `.next()` to update the subject, and the other `.subscribe()`s to read the data.

**Example Use Case:**
- A "Shopping Cart" icon in the top Navbar needs to update its counter when a "Add to Cart" button is clicked deep inside a Product Detail page.

---

## 44. When should you use an EventEmitter vs a Subject?

**Answer:**
- **EventEmitter:** Extends RxJS Subject, but should *only* be used with the `@Output()` decorator to dispatch events from a child component to an immediate parent. It hooks directly into Angular's event binding syntax `(myEvent)="action()"`.
- **Subject / BehaviorSubject:** Should be used strictly inside Services for cross-component communication. You should *never* use `@Output()` to try to pass data to a service.

---

## 45. Explain ChangeDetectorRef` methods: detectChanges() vs markForCheck().

**Answer:**
When using `OnPush` change detection, Angular doesn't automatically detect changes caused by `setTimeout` or asynchronous API callbacks without the AsyncPipe. 

- **`markForCheck()`:** Marks the current component (and its ancestors) to be checked during the *next* normal change detection cycle.
- **`detectChanges()`:** Forces an *immediate, synchronous* change detection run on the component and its children right exactly on that line of code.

**Use Cases:**
- **markForCheck:** Best practice when a value updates in `OnPush`, letting Angular decide when to render.
- **detectChanges:** Usually used in complex DOM calculations where you need Angular to render the view *right now* so you can immediately measure element heights/widths on the next line.

---

## 46. What are Route Preloading Strategies?

**Answer:**
Preloading happens in the background after the initial application has loaded. It downloads lazy-loaded modules *before* the user clicks on them, giving the best of both worlds (fast initial load + instant secondary navigation).

Angular provides two out-of-the-box strategies:
1.  **NoPreloading (Default)**: Modules are only downloaded when clicked.
2.  **PreloadAllModules**: Downloads all lazy-loaded modules in the background ASAP.

**Example:**
```typescript
RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
```

---

## 47. What is `entryComponents`? (Legacy)

**Answer:**
Prior to Angular 9 (Ivy), any component that was loaded dynamically via code (e.g., opening a Modal popup using `ComponentFactoryResolver`) rather than being hardcoded in an HTML template had to be declared in the `entryComponents` array of the NgModule. 
With Ivy, this array is completely deprecated and no longer needed because the compiler is smart enough to find dynamic components.

---

## 48. Protractor vs Cypress in Angular Testing.

**Answer:**
- **Protractor:** The legacy E2E (End-to-End) testing framework strictly built for Angular based on Selenium. It was notoriously flaky, slow, and was officially deprecated by the Angular team.
- **Cypress / Playwright:** Modern E2E testing tools. They are framework-agnostic, execute natively within the browser, and are infinitely faster, more reliable, and offer visual time-travel debugging.

**Use Cases:**
Any modern Angular enterprise project will abandon Protractor for Cypress or Playwright.

---

## 49. How do you implement global routing loading bars?

**Answer:**
Since fetching lazy-loaded chunks or executing Route Resolvers takes time, you subscribe to the Angular Router's events stream in the root `AppComponent`.

**Example:**
```typescript
this.router.events.subscribe(event => {
  if (event instanceof RouteConfigLoadStart || event instanceof ResolveStart) {
    this.isLoading = true;
  } else if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
    this.isLoading = false;
  }
});
```

---

## 50. What is Zone.js and why does Angular use it?

**Answer:**
`Zone.js` is an execution context for JavaScript. It essentially monkey-patches (hijacks) all asynchronous browser APIs like `setTimeout`, `setInterval`, Promises, and DOM events (clicks). 
When an async operation finishes, `Zone.js` notifies Angular, which then triggers a global Change Detection cycle because Angular assumes "If an async event just happened, the data probably changed."

**Pros & Cons:**
*   **Pros:** This allows developers to write pure, readable code without manually telling the framework when to update the DOM.
*   **Cons:** Unoptimized monkey-patching inherently slows down the browser. The Angular team is aggressively working on "Zoneless" Angular using Signals (introduced in v16/v17/v18).
