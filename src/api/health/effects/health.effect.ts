import { r } from '@marblejs/http'
import { mapTo } from 'rxjs/operators'

export const health$ = r.pipe(
  r.matchPath('/health'),
  r.matchType('GET'),
  r.useEffect((req$) =>
    req$.pipe(
      mapTo({
        body: { success: true, message: "The oven is hot let's cook..." }
      })
    )
  )
)
