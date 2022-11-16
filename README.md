# Note:
Tis repository has been archived as it does not provide any perfomance boost anymore because with Ivy Angular has improved the test performance by default.

# NgxPrepareTestEnvironment

Provides the helper function `prepareTestEnvironment` to speed up your tests. It is inspired by the blogpost
[Angular Unit Testing performance](https://blog.angularindepth.com/angular-unit-testing-performance-34363b7345ba).

#### Caution

This function overrides `TestBed.resetTestingModule`,
This could cause problems as we are changing the intended behaviour. With the release of this package we have this
function in use for over a year, running over 5000 unittests and have not hit any issues with it yet.

#### Ivy

Ivy, the new render engine from angular, also comes with a new renderer for tests.
The angular team has here also worked on the performance. In case you are using ivy
`TestBed.resetTestingModule` isn't overriden any more. What we still do is:

- Reducing the necessary boilerplate
- Improve the way to remove the template to improve test speed in [unit tests](#unit-testing)

## How to use

Instead of writing:

```typescript
//...
beforeEach(async(() => {
  TestBed.configureTestingModule({
    declarations: [MyComponent],
  }).compileComponents();
}));

beforeEach(() => {
  fixture = TestBed.createComponent(MyComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});
//...
```

You will be able to use `prepareTestEnvironment`:

```typescript
const sharedConfig: TestModuleMetadata = {
  declarations: [MyComponent],
};

describe('MyComponent #unit', () => {
  //...

  prepareTestEnvironment(sharedConfig, MyComponent);

  beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent);

    comp = fixture.componentInstance;
  });

  //...
});
```

This does not only save you a couple lines of code, but also provides the following advantages:

## Unit testing

For us a unit test of a component is a test without its template. This brings the advantage that you do not have to provide
all dependencies of the template.
Furthermore `fixture.detectChanges();` starts costing more and more time with bigger components.

This is why we are override the template in the background with `TestBed.overrideTemplate` if the component that is to be tested is provided to `prepareTestEnvironment`.
so there is no need to call `fixture.detectChanges();`.

After `fixture = TestBed.createComponent(ServerLocationComponent);` the component is alive with all its dependencies and ready for you to test all of its
public methods without having to worry about render-time issues.
If your methods rely on preparations done in `ngOnInit` you can call it manually in a `beforeEach` or similar.

## Integration testing

For us a integration test is a test with the whole component, including the template. If the last argument of `prepareTestEnvironment` is not a component, we do not override the template.
Integration tests are missing the performance boost of empty templates, but by with overriding the `TestBed.resetTestingModule` we are achieving a significant performance boost aswell.

```typescript
const sharedConfig: TestModuleMetadata = {
  declarations: [MyComponent],
};

describe('MyComponent #unit', () => {
  //...
});

const integrationConfig: TestModuleMetadata = {
  declarations: [AnotherComponent, MoreComponents, MyMockComponent],
};

describe('MyComponent #integration', () => {
  //...

  prepareTestEnvironment(sharedConfig, integrationConfig);

  beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent);

    comp = fixture.componentInstance;
  });

  //...
});
```

## (Jest) Snapshot testing

You can pass as many `TestModuleMetadata` configurations to `prepareTestEnvironment` as you like. Their contents will be merged and are enabling you to use more complex setups in your testfiles. We are using this functionality to run snapshot tests in jest with real components, to see if the DOM has been rendered correctly:

```typescript
// ...

const snapshotConfig: TestModuleMetadata = {
  declarations: [MyRealComponent],
};

describe('MyComponent #snapshot', () => {
  //...

  prepareTestEnvironment(sharedConfig, integrationConfig, snapshotConfig);

  beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent);

    comp = fixture.componentInstance;
  });

  it('should render correctly', () => {
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
  //...
});
```
