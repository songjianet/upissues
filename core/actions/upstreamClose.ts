import type { Context } from '../types'
import { COMMENT_FORWARD_ISSUE_RE } from '../constants'
import { info } from '../utils'

export async function updateUpstream(ctx: Context) {
  const { octokit, event } = ctx
  if ('action' in event && event.action === 'closed' && 'issue' in event) {
    const body = event.issue.body || await octokit.rest.issues.get({ issue_number: event.issue.number, ...ctx.source }).then(i => i.data.body)
    const match = body?.match(COMMENT_FORWARD_ISSUE_RE)
    if (!match)
      return
    const [, owner, repo, number] = match
    info('>>> Found upstream issue')
    info(`https://github.com/${owner}/${repo}/issues/${number}`)
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: +number,
      state: 'closed',
    })
    return true
  }
}
