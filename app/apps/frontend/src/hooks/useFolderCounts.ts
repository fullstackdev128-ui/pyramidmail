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
        drafts: countUnread(drafts.data),
        trash: countUnread(trash.data),
        spam: countUnread(spam.data),
        starred: countUnread(starred.data),
        importants: countUnread(important.data),
        sent: countUnread(sent.data),
      };
    },
    refetchInterval: 5000, // Refresh every 5s for near real-time updates
  });
}
