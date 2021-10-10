import { createServer } from '@marblejs/http'
import { IO } from 'fp-ts/lib/IO'
import { listener } from '@app'
import { Config } from '@config'

const server = createServer({
  port: Config.server.port,
  hostname: Config.server.host,
  listener
})

const main: IO<void> = async () => await (await server)()

main()
