# Task Spec: Sales Management v2.0 Proactive Action Layer

## 1. Background

현재 영업관리시스템은 리드, 고객사, 영업기회, 활동, 관리자 설정을 중심으로
영업 데이터를 기록하고 관리하는 운영형 시스템이다.
v2.0에서는 이 시스템을 유지하면서, 영업대표가 별도로 사용하던 AI 기반
선제적 액션 레이어를 메인 시스템 안으로 흡수해야 한다.

이번 확장의 핵심은 다음과 같다.

- 기존 영업관리시스템은 시스템 오브 레코드(System of Record)로 유지한다.
- AI는 기존 데이터를 보조하는 조력자가 아니라, 제안, 초안, 추천, 감지, 알림을
  선제적으로 수행하는 실행 레이어가 된다.
- 다만 AI가 사용자의 승인 없이 고객-facing 액션을 직접 완료하지 않도록
  안전 장치를 둔다.

## 2. Goal

영업관리시스템 v2.0에서 아래 네 가지 능력을 지원하는 설계와 구현 기준을 정의한다.

1. 자연어 기반 CRM 조작과 엔티티 체이닝
2. 백그라운드 위험/기회 감지 및 Slack 알림
3. Gmail Draft / Google Calendar 기반 외부 워크플로우 제어
4. 인적 네트워크 그래프와 Bridge Insights 추천

## 3. Product Positioning

- 제품명은 계속 `영업관리시스템`을 사용한다.
- 이번 확장 버전은 내부적으로 `영업관리시스템 2.0`으로 관리한다.
- 아키텍처 레이어 명칭은 `Proactive Action Layer`를 사용한다.

## 4. Non-goals

- LLM이 운영 DB를 임의 SQL로 직접 수정하게 만들지 않는다.
- Gmail 자동 발송은 이번 범위에 포함하지 않는다. 초안 생성까지만 지원한다.
- 브라우저 토큰 의존형 개인 스크립트는 표준 운영 경로로 채택하지 않는다.
- 완전 자동 영업 단계 변경은 도입하지 않는다. 추천과 승인 흐름을 기본값으로 둔다.
- 외부 메신저, 전화 시스템, ERP, 그룹웨어 전체 통합은 이번 2.0 범위에서 제외한다.

## 5. Functional Requirements

### 5.1 AI Agent and Tool Use Layer

#### 5.1.1 자연어 기반 엔티티 체이닝

- 사용자는 챗봇 입력창 또는 영업기회/활동 보조 입력창에 자연어로 상황을 입력할 수 있어야 한다.
- 시스템은 입력 문장에서 고객사, 담당자, 영업기회, 활동, 일정, 금액, 단계, 후속 액션을 추출해야 한다.
- 시스템은 기존 데이터와 중복/유사 매칭을 수행해야 한다.
- 사용자가 승인하면 Account, Contact, Opportunity, Activity를 묶어서 생성/수정해야 한다.
- 한 번의 입력이 여러 엔티티를 건드리는 경우에도 감사 로그를 남겨야 한다.

#### 5.1.2 LLM 툴 실행 레지스트리

- 메인 시스템은 고정 UI 입력 외에 LLM function calling 경로를 지원해야 한다.
- 툴은 읽기/쓰기/추천/초안 계열로 분류해야 한다.
- 각 툴은 입력 스키마, 권한 범위, 실행 결과, 감사 로그 정책을 가져야 한다.
- 승인 필요 툴과 즉시 실행 가능 툴을 분리해야 한다.

#### 5.1.3 영업 단계 추천

- 미팅록, 콜 요약, 활동 결과를 LLM과 규칙 엔진이 함께 분석해야 한다.
- 시스템은 현재 영업기회의 다음 적정 단계를 추천할 수 있어야 한다.
- 추천 사유를 사용자에게 보여줘야 한다.
- 사용자는 추천을 수락하거나 거절할 수 있어야 한다.

### 5.2 Proactive Risk and Opportunity Engine

#### 5.2.1 하드코딩 위험 시그널

- POC 단계 진입 후 14일 동안 후속 활동이 없는 영업기회를 감지해야 한다.
- 견적 발송 후 7일 동안 추가 커뮤니케이션이 없는 영업기회를 감지해야 한다.
- 신규 등록 후 21일 동안 첫 미팅이나 콜이 없는 리드/영업기회를 감지해야 한다.

#### 5.2.2 선제적 알림

- 위험 시그널은 매일 아침 배치로 계산되어야 한다.
- 필요 시 특정 이벤트 발생 직후 재계산될 수 있어야 한다.
- 감지 결과는 영업담당자의 Slack DM으로 발송할 수 있어야 한다.
- 알림에는 요약, 위험 사유, 마지막 활동일, 권장 다음 행동이 포함되어야 한다.

### 5.3 External Workflow Control Layer

#### 5.3.1 Gmail Draft

- 사용자는 후속 메일, 제안 메일, 리마인드 메일 초안을 AI에게 생성 요청할 수 있어야 한다.
- 시스템은 메일을 바로 발송하지 않고, Gmail Draft까지만 생성해야 한다.
- 초안에는 수신자, 제목, 본문, 관련 영업기회 문맥이 반영되어야 한다.

#### 5.3.2 Google Calendar Sync

- 서버는 사용자별 refresh token을 안전하게 보관해야 한다.
- 백그라운드 동기화로 당일 일정과 향후 일정 정보를 수집할 수 있어야 한다.
- 데일리 브리핑이나 영업기회 컨텍스트에 일정 정보를 반영해야 한다.

### 5.4 Human Network and Bridge Insights

#### 5.4.1 인맥 그래프 뷰어

- 사용자와 고객사 담당자, 소개자, 과거 직장, 관계 강도를 노드/링크 구조로 조회할 수 있어야 한다.
- 그래프는 특정 고객사, 특정 담당자, 특정 영업기회를 중심으로 필터링할 수 있어야 한다.
- 그래프는 D3.js 기반 캔버스 UI로 시각화해야 한다.

#### 5.4.2 Bridge Insights

- 특정 영업기회나 고객사 화면에서 연결 가능한 인맥 후보를 자동 추천해야 한다.
- 추천에는 관계 근거, 친밀도, 소개 가능성, 연결 경로를 포함해야 한다.
- 추천은 단순 리스트뿐 아니라 그래프의 일부로도 탐색 가능해야 한다.

## 6. Technical Requirements

### 6.1 Runtime Split

저장소는 유지하되 실행 단위를 분리한다.

- `frontend`: 기존 React UI와 v2.0 보조 패널, 그래프 UI
- `main-api`: 기존 CRM API와 승인형 액션 API의 시스템 오브 레코드
- `agent-worker`: 자연어 파싱, tool execution orchestration, stage recommendation
- `risk-worker`: 위험 시그널 계산, Slack 알림, 스케줄 실행
- `integration-worker`: Gmail Draft, Google Calendar sync
- `insight-service` 또는 `bridge-service`: 인맥 그래프 질의와 추천 연산

### 6.2 Source Split

권장 소스 구조는 아래와 같다.

```text
frontend/
backend/
  app/
    api/
    core/
    db/
    models/
    schemas/
    services/
      crm_core/
      approvals/
      audit/
  workers/
    agent_worker/
    risk_worker/
    integration_worker/
  insights/
    bridge_service/
shared/
  contracts/
  prompts/
  events/
docs/
  specs/
  architecture/
  operations/
```

### 6.3 Data Flow Rules

- 메인 데이터 저장 책임은 `main-api`가 가진다.
- worker는 DB를 임의 수정하지 않고 application service 또는 내부 command API를 통해 변경한다.
- LLM 결과는 반드시 structured output으로 받고, 파싱 실패 시 명시적으로 실패 처리한다.
- 외부 API 호출 결과는 raw payload와 상태 로그를 저장한다.
- 승인 기반 액션은 `suggested -> approved -> executed` 상태 머신을 가져야 한다.

### 6.4 Security and Governance

- 사용자별 외부 연동 토큰은 암호화 저장한다.
- LLM 툴 호출, 제안, 승인, 실행 이력을 모두 감사 로그로 남긴다.
- Gmail Draft, Slack DM, Calendar read는 사용자 권한과 연결 상태를 검증해야 한다.
- AI 쓰기 툴은 RBAC와 별개로 툴별 실행 권한 정책을 가진다.

### 6.5 Testing Requirements

- 자연어 엔티티 체이닝은 unit test + integration test가 필요하다.
- 단계 추천은 unit test와 승인 API regression test가 필요하다.
- 위험 시그널은 시그널별 규칙 테스트가 필요하다.
- Slack, Gmail, Calendar는 mock/fake adapter 기반 integration test가 필요하다.
- Bridge Insights는 추천 규칙 unit test와 그래프 API integration test가 필요하다.
- 주요 UI 흐름은 e2e 또는 적어도 회귀성 프론트 테스트가 필요하다.

## 7. Data Model Delta

### 7.1 신규 개념

- `agent_action_requests`
- `agent_action_results`
- `stage_recommendations`
- `risk_signals`
- `notification_deliveries`
- `external_accounts`
- `external_tokens`
- `calendar_events_cache`
- `email_drafts`
- `relationship_nodes`
- `relationship_edges`
- `bridge_recommendations`

### 7.2 기존 엔티티 확장

- Lead / Opportunity / Activity에 AI 분석 메타데이터 참조 키 추가
- Opportunity에 stage recommendation 상태 참조
- Activity에 source type, AI summary, follow-up suggestion 필드 확장 검토
- Account / Contact에 bridge graph 식별자와 관계 메타데이터 추가 검토

## 8. UX Requirements

- 기존 영업관리 화면은 유지한다.
- v2 기능은 처음부터 모든 화면을 바꾸지 않고, 오른쪽 보조 패널 또는 별도 탭으로 점진 도입한다.
- 사용자는 AI 추천과 실제 저장 결과를 구분해서 볼 수 있어야 한다.
- 외부 액션은 항상 사용자 승인 여부를 명확히 보여줘야 한다.

## 9. Rollout Strategy

### Phase A
- 구조 분리와 공통 계약 정의

### Phase B
- AI 자연어 엔티티 체이닝 MVP

### Phase C
- 위험 시그널과 Slack DM

### Phase D
- Gmail Draft / Calendar sync

### Phase E
- Bridge Insights / 그래프 UI

### Phase F
- 운영 정책, 비용, 성능, 감사 로그 고도화

## 10. Acceptance Criteria

- [ ] v2.0 아키텍처 분리 기준이 문서화되어 있다.
- [ ] 기능 요구사항과 기술 요구사항이 분리되어 있다.
- [ ] 실행 단위별 책임과 데이터 경계가 정의되어 있다.
- [ ] AI 쓰기 액션의 승인/감사 정책이 정의되어 있다.
- [ ] 위험 시그널, 외부 워크플로우, Bridge Insights의 MVP 범위가 정리되어 있다.
- [ ] 후속 구현 계획이 별도 문서로 연결되어 있다.
