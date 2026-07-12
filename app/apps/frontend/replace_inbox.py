from pathlib import Path
path = Path(r'c:\Users\BSE\Desktop\pyramidmail-main\apps\frontend\src\pages\InboxPage.tsx')
text = path.read_text(encoding='utf-8')
start = '      <div className={cn("flex-1 flex flex-col bg-white", isMobile && view === "list" && "hidden")}> \n'
end = '      </div>\n\n      {previewAttachment && (\n'
idx = text.index(start) + len(start)
jdx = text.index(end)
new = '''        {selectedThreadId ? (
          <EmailReadPanel
            thread={selectedEmail}
            isLoading={isLoadingDetail}
            isDesktop={isDesktop}
            onBack={isMobile ? handleBack : undefined}
            onReply={() => {
              const subject = selectedEmail.subject.toLowerCase().startsWith("re:")
                ? selectedEmail.subject
                : `Re: ${selectedEmail.subject}`;
              openCompose({
                to: [selectedEmail.from.email],
                subject,
                body: "",
              });
            }}
            onStarToggle={() => starMutation.mutate(selectedEmail.id)}
            onMove={(folder) => {
              if (folder === "TRASH" && folderFromPath === "TRASH") {
                deleteMutation.mutate(selectedEmail.id);
              } else {
                moveMutation.mutate({ id: selectedEmail.id, folder });
              }
              if (isMobile) {
                handleBack();
              }
            }}
            onRefresh={() => refetch()}
            onToggleRead={() => markReadMutation.mutate({ id: selectedEmail.id, isRead: !selectedEmail.isRead })}
            onToggleImportant={() => markImportantMutation.mutate(selectedEmail.id)}
            previewAttachment={previewAttachment}
            onPreviewAttachment={setPreviewAttachment}
          />
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-[#162A42]">{t("inbox.welcomeTitle")}</h2>
                <p className="text-slate-500 mt-1">{t("inbox.welcomeSubtitle")}</p>
              </div>
              <Button
                variant="outline"
                className="h-11 rounded-xl px-6 gap-2"
                onClick={() => openCompose()}
              >
                <Plus size={18} />
                {t("inbox.newMessage")}
              </Button>
            </div>
            <div className="flex-1 overflow-hidden p-8">
              <div className="h-full rounded-3xl bg-[#F5F8FB] p-10 flex flex-col justify-center items-center text-center gap-4">
                <div className="w-24 h-24 rounded-3xl bg-[#E3EFF9] flex items-center justify-center">
                  <Mail size={32} className="text-[#0087CA]" />
                </div>
                <div className="max-w-sm">
                  <h3 className="text-xl font-bold text-[#162A42]">{t("inbox.noSelectionTitle")}</h3>
                  <p className="text-slate-600 mt-2">
                    {t("inbox.noSelectionDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
'''
text = text[:idx] + new + text[jdx:]
path.write_text(text, encoding='utf-8')
print('updated')
