import type { Metadata } from "next";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "케쓰(KETH) 웹사이트 개인정보처리방침입니다.",
};

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "1. 개인정보의 수집",
    body: "케쓰(KETH) 웹사이트는 소개용 정적 페이지로 운영되며, 방문자에게 별도의 회원가입·로그인·지원서 접수 기능을 제공하지 않습니다. 따라서 이 사이트를 이용하는 과정에서 이름, 연락처 등 개인을 식별할 수 있는 정보를 직접 수집하지 않습니다.",
  },
  {
    heading: "2. 문의를 통해 제공되는 정보",
    body: "채용이나 협업 문의를 위해 이메일 등으로 정보를 보내 주시는 경우, 해당 정보는 문의에 대한 응대와 채용 검토 목적으로만 이용됩니다. 수집된 정보는 이용 목적이 달성된 후 지체 없이 파기하며, 채용 목적 외의 다른 용도로 사용하지 않습니다.",
  },
  {
    heading: "3. 쿠키 및 접속 정보",
    body: "서비스 운영과 안정성 확보를 위해 웹 서버 접속 기록 등 최소한의 기술적 정보가 자동으로 생성될 수 있습니다. 이 정보는 통계와 서비스 개선 목적으로만 활용되며, 개인을 특정하는 데 사용하지 않습니다.",
  },
  {
    heading: "4. 개인정보의 제3자 제공",
    body: "케쓰는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 법령에 근거하거나 수사기관의 적법한 요청이 있는 경우에 한해 예외적으로 제공될 수 있습니다.",
  },
  {
    heading: "5. 이용자의 권리",
    body: "이용자는 자신의 개인정보에 대한 열람, 정정, 삭제를 언제든 요청할 수 있습니다. 요청은 아래 문의 창구를 통해 접수되며, 확인 후 지체 없이 조치합니다.",
  },
  {
    heading: "6. 방침의 변경",
    body: "이 개인정보처리방침은 법령이나 서비스 정책의 변경에 따라 개정될 수 있으며, 변경 시 본 페이지를 통해 안내합니다.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy Policy"
        title="개인정보처리방침"
        description="케쓰는 방문자의 개인정보를 소중히 다루며, 최소한의 정보만을 처리합니다."
      />

      <section>
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-sm text-subtle">시행일자: 2026년 7월 14일</p>
          <div className="mt-10 flex flex-col gap-10">
            {SECTIONS.map((s) => (
              <Reveal key={s.heading}>
                <h2 className="text-lg font-bold tracking-display text-ink md:text-xl">
                  {s.heading}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted md:text-base">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
