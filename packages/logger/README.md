# @officr/logger

> Lightweight zeroconfig pretty logger.

## Install

```bash
npm install --save-dev @officr/logger
```

## Logging

```typescript
import logger from '@officr/logger'

logger.debug('debug message only visible in DEBUG mode')
logger.log('log messages')
logger.info('info logging')
logger.warning('warning logging')
logger.errors('error logging')
logger.success('success logging')
```

### with labels

```typescript
const feature = logger.label('feature')

feature.debug('debug message')
feature.log('log messages')
feature.info('info logging')
feature.warning('warning logging')
feature.errors('error logging')
feature.success('success logging')
```

## Config

```typescript
/** apply config flags */
logger.config(flags: {
  /** whether to log to the console or not
   * @default true
   */
  console?: boolean

  /** whether to set a non zero exit code when errors
   * @default false
   */
  computeExitCode?: boolean

  /** whether to log the number of errors at exit
   * @default false
   */
  logStatsOnExit?: boolean

  /** whether to add timestamp
   * @default false
   */
  timestamp?: boolean
})
```

## Streaming

### record to a file

```typescript
const stream = logger.record('path/to/log-file.log')
```

### record to a json file

```typescript
const stream = logger.record('path/to/log-file.log', json)
```

### pipe to a stream

```typescript
const stream = logger.pipe(...)
```

## Stats

```typescript
const {
  total,
  errors,
  warnings,
  success
} = logger.stats()
```
