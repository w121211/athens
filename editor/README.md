# Workflow

### Doc Cases

local-doc

- doc-got-draft-and-note when remote has note and user's draft
- doc-got-draft-only when remote has no note but user's draft is existed
- doc-got-note-ony when remote has note but user's draft is not existed
- doc-got-nothing when remote has neither draft nor note, a shiny new local-doc is created

doc sync status

- synced is sync with remote
- not-synced local updates not synced with the remote yet
- remote-not-exist remote-draft is not existed, cannnot perform sync
- conn-lost connection lost

**Temporary doc (doc-no-draft)**

Case: temporary doc (doc-has-note, doc-has-nothing, @ie draft not existed)

- for user to view doc rather edit
- doc is 'created' in local but should not show in sidebar yet
- disable auto-save, remind if not saved

Case: save temporary doc
-> save doc
-> doc is listed on sidebar

Case: left temporary doc && current doc is modified
-> ask to save -> (yes) ... / (no) remove doc

Case: left temporary doc && current doc is not modified
-> remove the doc

**Syncable doc (doc-got-draft)**

Case: click 'save' button
-> save doc: collect blocks, submit to remote & return a success flag
-> update sync-status to 'synced'

Case: left syncable doc
-> save doc
-> keep the doc in memory

Case: sync automatically every n seconds

Case: edit a doc after saved
-> ??? how to detect, when block-save fire?
-> update sync-status to 'not-synced'

**Edit note-meta**

Case: edit note-meta when note is existed (doc-got-draft-and-note, doc-got-note-ony)
-> (ui) shows a note-meta edited icon?

Case: edit note-meta when note is not existed (doc-got-draft-only, doc-got-nothing)
-> do nothing

**Rename**

Case: rename when note is existed (doc-got-draft-and-note, doc-got-note-ony)
-> doc keeps its original title && update note-meta.title = new-name
-> (ui) shows previous name? sidebar?

Case: rename when note is not existed (doc-got-draft-only, doc-got-nothing)
-> update followings to new-name `doc .title`, `doc-block .doc-title, .str`
-> route to new name !!! save required? !!!

**Remove**

Case: remove doc for tempoary doc (doc-no-draft)
-> remvoe locally
-> redirect to blank ???

Case: remove doc for doc-got-draft
-> update remote draft status to 'remove'
-> remvoe locally
-> redirect to blank ???

**Editor errors**

Case: doc block tree's structure is wrong

Case: any exception throws by the editor

**Notifications, warnnings**

Case: show notification for a merge request

Case: show warning for current doc is behind remote note

#

Stories

- note meta form
- note starter with template buttons

Discuss post

- add code-block
-
