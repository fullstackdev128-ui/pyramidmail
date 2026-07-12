import { useQuery } from "@tanstack/react-query";
import { emailService } from "@/services/email.service";
import { ThreadSummary } from "./useThreads";

export function useFolderCounts() {
  return useQuery({
    queryKey: ["folder-counts"],
    queryFn: async () => {
      // Fetch all relevant folders in parallel
      const [inbox, drafts, trash, spam, starred, important, sent] = await Promise.all([
        emailService.getThreads({ folder: "INBOX" }),
        emailService.getThreads({ folder: "DRAFT" }),
        emailService.getThreads({ folder: "TRASH" }),
        emailService.getThreads({ folder: "SPAM" }),
        emailService.getThreads({ starred: true }),
        emailService.getThreads({ important: true }),
        emailService.getThreads({ folder: "SENT" }),
      ]);

      const countUnread = (threads: ThreadSummary[]) => 
        threads.filter(t => t.unreadCount > 0).length;

      return {
        inbox: countUnread(inbox.data),
        drafts: drafts.data.length,
        trash: trash.data.length,
        spam: spam.data.length,
        starred: starred.data.length,
        importants: important.data.length,
        sent: sent.data.length,
      };
    },
    refetchInterval: 60000, // Refresh every 60s
  });
}
