import { createServer } from '@marblejs/http'
import { IO } from 'fp-ts/lib/IO'

import { Config } from '@config'
import { listener } from '@app'

const server = createServer({
  port: Config.server.port,
  hostname: Config.server.host,
  listener
})

const main: IO<void> = async () => await (await server)()

main()
