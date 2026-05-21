export type ChatAttachmentKind = 'image' | 'video' | 'document';

export type ChatSelectedAttachment = {
  uri: string;
  type?: string | null;
  name: string;
  kind: ChatAttachmentKind;
};
