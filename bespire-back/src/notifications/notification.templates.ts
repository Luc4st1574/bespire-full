// notification.templates.ts
type TemplateFn = (ctx: any) => string;

export const notificationTemplates: Record<
  string,
  {
    title: TemplateFn;
    description: TemplateFn;
    message?: TemplateFn; // Optional for some types
  }
> = {
  comment: {
    title: (ctx) =>
      `${ctx.commenterName} commented on your ${ctx.categoryName}`,
    description: (ctx) => 'Review the feedback',
    message: (ctx) =>
      ctx.commentText
        ? ctx.commentText.replace(/<[^>]+>/g, '')
        : 'Review the feedback',
  },
  review: {
    title: (ctx) => `${ctx.reviewerName} reviewed your ${ctx.categoryName}`,
    description: (ctx) => 'Review the feedback',
    message: (ctx) =>
      ctx.rating
        ? `Rating: ${ctx.rating} - ${ctx.feedback}`
        : 'Review the feedback',
  },
  assigned_team_member: {
    title: (ctx) =>
      `Bespire member ${ctx.assignedUserName} has been assigned to ${ctx.linkedToType}!`,
    description: (ctx) => 'Review the details in your dashboard',
  },
  assigned_success_manager: {
    title: (ctx) =>
      ctx.isOwner
        ? `A Success Manager has been assigned!`
        : `You have been assigned as Success Manager for ${ctx.companyName}!`,
    description: (ctx) =>
      ctx.isOwner
        ? 'You can contact them and review the details in your dashboard.'
        : 'Review the details and start the follow-up in your dashboard',
  },
  request_submitted: {
    title: (ctx) => `Request Submitted Successfully.`,
    description: (ctx) => `Request is being reviewed by the team.`,
  },
  request_status_updated: {
    title: (ctx) => `${ctx.requestTitle} Status Updated`,
    description: (ctx) => {
      const status = ctx.status ? ctx.status.replace(/_/g, ' ') : '';
      return `The status of request has been updated to ${status}.`;
    },
  },
  // ... agrega tus propios tipos y variantes
  default: {
    title: (ctx) => `New ${ctx.categoryName || ctx.category || 'Notification'}`,
    description: () => 'You have a new notification',
  },
};
