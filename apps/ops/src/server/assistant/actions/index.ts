import 'server-only'

/**
 * Every Assistant action module, imported for its registerAction side effect (S05-T02). The runner's Inngest
 * function imports this file once.
 */
import './classify-mail'
import './link-mail'
import './ooo-facts'
import './ask-open-copy'
import './resend-alternate-contact'
import './manual-reply'
import './correction-email'
import './instruction'
import './extract-lines'
import './request-original'
import './create-enquiry'
import './resolve-extracted-line'
