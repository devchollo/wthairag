
const fs = require('fs');
const path = 'c:\\Users\\Liam Sevillejo\\Desktop\\sevillejo\\wthairag\\frontend\\src\\app\\workspace\\settings\\page.tsx';

const newContent = `            {activeTab === 'members' && (
                <div className="space-y-6 animate-in fade-in duration-400">
                    <div className="card p-0 border-2 border-border-light overflow-hidden">
                        <div className="p-8 border-b border-border-light flex items-center justify-between bg-surface-light/50">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-600" />
                                <h3 className="font-black text-lg tracking-tight">Workspace Members</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{members.length} Controlled Identities</div>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="h-8 px-4 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                                    >
                                        Invite Personnel
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="divide-y divide-border-light">
                            {membersLoading ? (
                                <div className="p-12 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest text-text-muted">Fetching membership records...</p>
                                </div>
                            ) : members.map((member) => (
                                <div key={member._id} className="p-6 flex items-center justify-between hover:bg-surface-light/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border-2 border-blue-100 font-black">
                                            {member.userId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-text-primary">{member.userId?.name}</h4>
                                                {member.role === 'owner' && <Crown className="h-3 w-3 text-amber-500" />}
                                                {member.userId?._id === user?._id && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">You</span>}
                                            </div>
                                            <p className="text-[10px] font-bold text-text-muted font-mono">{member.userId?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end gap-1">
                                            <label className="text-[8px] font-black uppercase tracking-widest text-text-muted">Access Level</label>
                                            <select
                                                value={member.role}
                                                disabled={member.role === 'owner' || member.userId?._id === user?._id}
                                                onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-blue-600 outline-none cursor-pointer disabled:opacity-50"
                                            >
                                                <option value="owner" disabled>Owner</option>
                                                <option value="admin">Administrator</option>
                                                <option value="member">Member</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        </div>

                                        {member.role !== 'owner' && member.userId?._id !== user?._id && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleResetMemberPassword(member.userId?.email)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Send Password Reset Email"
                                                >
                                                    <Lock className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isAdmin && invites.length > 0 && (
                        <div className="card p-0 border-2 border-border-light overflow-hidden mt-8">
                            <div className="p-8 border-b border-border-light flex items-center gap-3 bg-surface-light/50">
                                <Mail className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-black text-lg tracking-tight">Pending Invitations</h3>
                            </div>
                            <div className="divide-y divide-border-light">
                                {invites.map((invite) => (
                                    <div key={invite._id} className="p-6 flex items-center justify-between hover:bg-surface-light/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border-2 border-indigo-100 font-black">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-text-primary">{invite.email}</h4>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                                                    <span>Role: <span className="text-blue-600 uppercase">{invite.role}</span></span>
                                                    <span>•</span>
                                                    <span>Invited by: {invite.invitedBy?.name || 'Admin'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancelInvite(invite._id)}
                                            className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showInviteModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-text-primary/10 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border-light p-8 space-y-6 animate-in zoom-in-95 duration-200">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-text-primary">Recruit Workspace Member</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Authorization will be sent via encrypted email</p>
                                </div>
                                <form onSubmit={handleInviteSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Personnel Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                                            placeholder="colleague@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Assignment Role</label>
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value as any)}
                                            className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                                        >
                                            <option value="admin">Administrator (Full Control)</option>
                                            <option value="member">Standard Member (Read/Write)</option>
                                            <option value="viewer">Guest Viewer (Read-Only)</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowInviteModal(false)}
                                            className="flex-1 h-11 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary border-2 border-border-light rounded-xl transition-all"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={inviteLoading}
                                            className="flex-1 btn-primary h-11 gap-2"
                                        >
                                            {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                            Send Invite
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
`;

let fileContent = fs.readFileSync(path, 'utf8');

// Find start
const startMarker = "{activeTab === 'members' && (";
const startIndex = fileContent.indexOf(startMarker);

// Find end (last occurrence of )} before the final generic div closes)
// Actually we can scan for the specific string `            )}` at the end of the block
const endMarker = `            )}
        </div>
    )
}`;

// Or search for the known corrupt sequence if we can identifier it
// Step 90 showed the file ends with:
// 672:             )}
// 673:         </div>
// 674:     )
// 675: }

// We want to replace from startIndex up to the line before "        </div>" (which corresponds to line 673 in step 90)
// This effectively means removing everything from `activeTab...` to the closing `)}`.

if (startIndex === -1) {
    console.log("Could not find start marker");
    process.exit(1);
}

// Find the closure of that block.
// Since the block is messed up, we can't trust the structure.
// But we know it follows `activeTab === 'account'` block.
// And it ends before `</div>` which ends the component.

const componentEndIndex = fileContent.lastIndexOf('        </div>'); // The div wrapping everything
if (componentEndIndex === -1) {
    console.log("Could not find component end");
    process.exit(1);
}

// We will replace from startIndex to componentEndIndex (exclusive of the final closing div logic which seems to be at line 673)
// Wait, file structure:
// <div className="mx-auto..."> (Line 312)
//    ...
//    {activeTab === 'members' && ( ... )}
// </div> (Line 673)
// )
// }

// So we want to replace from `startIndex` up to the *last* `            )}` that is before the final `</div>`.
// Since the file is broken, there might be extra `</div>`.

// Let's just slice from startIndex to componentEndIndex, and trim any whitespace, and see.
// The new content includes `)}` at the end.
// So we want to put it *before* the `</div>` at line 673.

// Check if we can find the text just BEFORE startIndex.
const beforeStart = fileContent.substring(0, startIndex);
// Check if we can find the text just AFTER the broken block.
// The broken block seems to end at line 672 `)}`.
// So we look for `        </div>` followed by `    )` followed by `}`.

const endSequence = `        </div>
    )
}`;

const endIndex = fileContent.lastIndexOf(endSequence);

if (endIndex === -1) {
    console.log("Could not find end sequence");
    // Fallback?
    // Let's assume the file ends with the component closure.
    // Try simpler:
    const simplerEnd = 'function RefreshCcw';
    const refreshIndex = fileContent.indexOf(simplerEnd);
    if (refreshIndex !== -1) {
        // Search backwards for `}`
        const lastBrace = fileContent.lastIndexOf('}', refreshIndex);
        // This `}` is the end of SettingsPage.
        // The `)` before it.
        // The `</div>` before it.
        // We can splice there.

        // BUT, to be safe, let's just use the fact that I know exactly what I want to put:
        // The `newContent` above IS the `activeTab === member` block.
        // So I just need to find where to put it.
        // It starts at `startIndex`.
        // It ends where the previous block ended.
        // The previous block ended at 672.
        // So I replace substring(startIndex, <index of line 673>)

        // Let's find line 673.
        // It's the line containing `        </div>` that closes the main div.

        // Strategy: Find `startIndex`. Find the `</div>` that closes the main wrapper.
        // The main wrapper starts at line 312.
        // It closes at line 673.
        // REPLACE (startIndex, <index of that div>) with newContent.
        // But wait, `newContent` *contains* `)}` at the end.
        // Yes.

        // How to find the correct `</div>`? It's the last one in the file before `RefreshCcw`.
        const lastDiv = fileContent.lastIndexOf('</div>', refreshIndex);
        if (lastDiv !== -1) {
            // Find the start of that line.
            const lineStart = fileContent.lastIndexOf('\n', lastDiv);

            const finalString = fileContent.substring(0, startIndex) + newContent + '\n' + fileContent.substring(lineStart);
            fs.writeFileSync(path, finalString);
            console.log("Rewrote file");
        } else {
            console.log("Could not find closing div");
        }
    }
} else {
    // We found endSequence, so we can replace up to it.
    const finalString = fileContent.substring(0, startIndex) + newContent + '\n' + fileContent.substring(endIndex);
    fs.writeFileSync(path, finalString);
    console.log("Rewrote file via endSequence");
}
