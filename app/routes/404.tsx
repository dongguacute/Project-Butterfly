import { NotFound } from "../components/not-found";

export function meta() {
  return [{ title: "页面未找到" }];
}

export default function ErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <NotFound message="404" details="抱歉，您访问的页面似乎飞走了。" />
    </div>
  );
}
