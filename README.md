# <img src="media/logo.png" title="vf-core-service-discovery" alt="vf-core-service-discovery logo" width="350">

![Build](https://github.com/oss6/vf-core-service-discovery/workflows/Build/badge.svg)
![Codecov](https://img.shields.io/codecov/c/github/oss6/vf-core-service-discovery)
![David](https://img.shields.io/david/oss6/vf-core-service-discovery)
![npm](https://img.shields.io/npm/v/vf-core-service-discovery)
![NPM](https://img.shields.io/npm/l/vf-core-service-discovery)

> :warning: This project is currently in active development; use with caution. Thanks!

`vf-core-service-discovery` is a tool to analyse the usage of [vf-core](https://github.com/visual-framework/vf-core) in your project.

# Table of contents

- [Table of contents](#table-of-contents)
- [Install](#install)
- [Basic usage](#basic-usage)
  * [CLI](#cli)
  * [Module](#module)
- [Features](#features)
- [CLI documentation](#cli-documentation)
- [Module documentation](#module-documentation)
- [What's next](#whats-next)
- [Contributing](#contributing)

# Install

Install the package using `npm` or `yarn` as follows:

```
$ npm i vf-core-service-discovery
```

```
$ yarn add vf-core-service-discovery
```

or globally

```
$ npm i -g vf-core-service-discovery
```

```
$ yarn global add vf-core-service-discovery
```

# Basic usage

## CLI

The main usage of `vf-core-service-discovery` is through a CLI.
A simple run of the following command will gather the usage of `vf-core` in the project:

```
$ vf-core-service-discovery run
```

An output example:

<img src="./media/vf-core-service-discovery-demo.gif" width="550" />

## Module

`vf-core-service-discovery` can also be used as a module. A use case for this is if you want to have more control on the process.

```js
import runServiceDiscovery from 'vf-core-service-discovery';

async function run() {
  const discoveryOutput = await runServiceDiscovery({
    forceRun: false,
    forceGitHubAuth: false,
    verbose: true,
    logFile: 'vf-core-service-discovery.log',
    loggingEnabled: true,
  });

  console.log(discoveryOutput);
}

run();
```

# Features

- Get package information such as current version, latest version, and component status.
- Get changelog if current and latest versions are mismatched.
- For each installed component get the dependent files (for now only `.html` files).

# CLI documentation

| Synopsis             | Description               |
|----------------------|---------------------------|
| `run`                  | Run the service discovery |
| `config [key] [value]` | Manage the configuration  |

## `run`

Synopsis: `vf-core-service-discovery run [options]`

### Options

| Option                  | Type    | Default                         | Description                 |
|-------------------------|---------|---------------------------------|-----------------------------|
| `-v`, `--verbose`           | boolean | false                           | Show debug information      |
| `-l`, `--log-file`          | string  | 'vf-core-service-discovery.log' | Log file location           |
| `-f`, `--force`             | boolean | false                           | By-pass the cache           |
| `-g`, `--force-github-auth` | boolean | false                           | Force GitHub authentication |

## `config`

Synopsis: `vf-core-service-discovery config [key] [value] [options]`

### Configuration items

| Key                 | Value  | Default | Description                              |
|---------------------|--------|---------|------------------------------------------|
| `cacheExpiry`       | string | 8h      | Time before the cache expires            |
| `lastInvalidation`  | Date   | null    | Last time the cache has been invalidated |
| `gitHubAccessToken` | string | ''      | GitHub access token                      |
| `vfCoreVersion`     | string | ''      | Latest vf-core release version           |

### Options

| Option             | Type    | Default                         | Description                     |
|--------------------|---------|---------------------------------|---------------------------------|
| `-v`, `--verbose`  | boolean | false                           | Show debug information          |
| `-l`, `--log-file` | string  | 'vf-core-service-discovery.log' | Log file location               |
| `-r`, `--reset`    | boolean | false                           | Reset configuration to defaults |

# Module documentation

## Types

Throughout the documentation you'll come across these types which define the inputs and outputs of the API.

### `Options`

The options to the service discovery runner.

```ts
interface Options {
  forceRun: boolean;
  forceGitHubAuth: boolean;
  verbose: boolean;
  loggingEnabled: boolean;
  logFile: string;
}
```

### `DiscoveryItem`

Defines a discovery item, which is a component under analysis (e.g. `vf-box`).

```ts
interface DiscoveryItem {
  name: string;                 // Component name (e.g. @visual-framework/vf-box)
  nameWithoutPrefix: string;    // e.g. vf-box
  version: string;              // Installed version of the component
  packageJson: PackageJson;     // Latest version package.json
  config: ComponentConfig;      // Latest version config
  changelog: ChangelogItem[];   // Changelog between the installed and latest version
  dependents: string[];         // Files that use the component
}
```

### `PDiscoveryItem`

An alias for `Partial<DiscoveryItem>`

`PipelineStep`

A pipeline step is a function that takes a source discovery item and a processing/pipeline context and returns the processed/extended discovery item.

```ts
export type PipelineStep = (source: PDiscoveryItem, context: PipelineContext) => Promise<PDiscoveryItem>;
```

### `PipelineContext`

Defines a context that is global to the pipeline.

```ts
interface PipelineContext {
  rootDirectory: string;    // Root directory to analyse
  vfPackagePrefix: string;  // '@visual-framework'
}
```

## `runServiceDiscovery`

Runs the service discovery.

### Parameters

- `options: Options`

### Returns

`Promise<PDiscoveryItem[]>`

### Example

```ts
import runServiceDiscovery from 'vf-core-service-discovery';

(async () => {
  const discoveryItems = await runServiceDiscovery({
    forceRun: false;
    forceGitHubAuth: false;
    verbose: true;
    loggingEnabled: true;
    logFile: 'vf-core-service-discovery.log';
  });

  console.log(discoveryItems);
})();
```

## `pipeline.Pipeline`

Class that defines a pipeline which processes discovery items.

### `Pipeline.getInstance`

Gets the `Pipeline` singleton.

### `addStep`

Adds a step to the pipeline.

#### Parameters

- `step: PipelineStep`

#### Returns

`Pipeline` - for chaining

#### Example

```ts
import { pipeline } from 'vf-core-service-discovery';

const vfPipeline = pipeline.getInstance();

vfPipeline
  .addStep(step1)
  .addStep(step2)
  .addStep(step3);
```

### `run`

Runs the pipeline given a source and a context.

#### Parameters

- `source: string[]`
- `context: PipelineContext`

#### Returns

`Promise<PDiscoveryItem[]>`

#### Example

```ts
import { pipeline } from 'vf-core-service-discovery';

const vfPipeline = pipeline.getInstance();
const source = ['vf-box', 'vf-footer'];
const context: PipelineContext = {
  rootDirectory: '/test',
  vfPackagePrefix: '@visual-framework',
};

(async () => {
  const discoveryItems = vfPipeline
    .addStep(step1)
    .addStep(step2)
    .addStep(step3)
    .run(source, context);

  console.log(discoveryItems);
})();
```

## Pipeline steps

Each pipeline step extends from the previous step.
Each component item (discovery item) goes through these steps.

These are imported as follows

```ts
import { pipeline } from 'vf-core-service-discovery';
```

### `getComponents`

Gets the installed components in the current project.

#### Parameters

- `context: PipelineContext`

#### Returns

- `Promise<string[]>`

#### Example

```ts
import { pipeline } from 'vf-core-service-discovery';

(async () => {
  const components = await pipeline.getComponents({
    rootDirectory: process.cwd()',
    vfPackagePrefix: '@visual-framework',
  });

  console.log(components);
})();
```

### `getExactVersion`

Extends the discovery item with the exact version of the installed component from the local lock file.

#### Parameters

- `discoveryItem: PDiscoveryItem`
- `context: PipelineContext`

#### Returns

`Promise<PDiscoveryItem>`

#### Example

```ts
import { pipeline } from 'vf-core-service-discovery';

(async () => {
  const discoveryItem = await pipeline.getExactVersion({
    name: '@visual-framework/vf-box',
    nameWithoutPrefix: 'vf-box',
  });

  console.log(discoveryItem.version);
})();
```

### `getPackageJson`

Extends the discovery item with the latest package.json of the installed component.

#### Parameters

- `discoveryItem: PDiscoveryItem`

#### Returns

`Promise<PDiscoveryItem>`

#### Example

```ts
import { pipeline } from 'vf-core-service-discovery';

(async () => {
  const discoveryItem = await pipeline.getPackageJson({
    name: '@visual-framework/vf-box',
    nameWithoutPrefix: 'vf-box',
    version: '1.2.3',
  });

  console.log(discoveryItem.packageJson);
})();
```

### `getConfig`

Extends the discovery item with the latest component configuration file (YAML or JS).

#### Parameters

- `discoveryItem: PDiscoveryItem`

#### Returns

`Promise<PDiscoveryItem>`

#### Example

```ts
import { pipeline } from 'vf-core-service-discovery';

(async () => {
  const discoveryItem = await pipeline.getConfig({
    name: '@visual-framework/vf-box',
    nameWithoutPrefix: 'vf-box',
    version: '1.2.3',
    packageJson: {
      version: '1.3.0',
    }
  });

  console.log(discoveryItem.config);
})();
```

### `getChangelog`

Extends the discovery item with the changelog between the installed and the latest version.

#### Parameters

- `discoveryItem: PDiscoveryItem`

#### Returns

`Promise<PDiscoveryItem>`

#### Example

```ts
import { pipeline } from 'vf-core-service-discovery';

(async () => {
  const discoveryItem = await pipeline.getChangelog({
    name: '@visual-framework/vf-box',
    nameWithoutPrefix: 'vf-box',
    version: '1.2.3',
    packageJson: {
      version: '1.3.0',
    },
    config: {
      title: 'Box',
      label: 'vf-box',
      status: 'live',
    }
  });

  console.log(discoveryItem.changelog);
})();
```

### `getDependents`

Extends the discovery item with the dependents of the component.

#### Parameters

- `discoveryItem: PDiscoveryItem`
- `context: PipelineContext`

#### Returns

`Promise<PDiscoveryItem>`

#### Example

```ts
import { pipeline } from 'vf-core-service-discovery';

(async () => {
  const discoveryItem = await pipeline.getDependents({
    name: '@visual-framework/vf-box',
    nameWithoutPrefix: 'vf-box',
    version: '1.2.3',
    packageJson: {
      version: '1.3.0',
    },
    config: {
      title: 'Box',
      label: 'vf-box',
      status: 'live',
    },
    changelog: []
  });

  console.log(discoveryItem.dependents);
})();
```

# What's next

1. Find dependents in different types of projects (for a start Angular and React).
2. API documentation.
3. Parallelise processing.
4. Better user experience and interface.

# Contributing

We welcome contributors and maintainers! To contribute please check the [contributing page](CONTRIBUTING.md) out.
