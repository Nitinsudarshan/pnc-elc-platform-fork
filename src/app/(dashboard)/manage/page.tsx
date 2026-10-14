import { redirect } from 'next/navigation';

export default function ManagePageRedirect() {
  redirect('/manage/letter-templates');
}
