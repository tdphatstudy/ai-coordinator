# ai-coordinator

Bộ điều phối production cho `skills`, `workflows`, `mcp`, và `agent profiles` dùng chung trên nhiều coding CLI agent.

## Chiến lược
- **Nền tảng chính thức**: Mapping adapter và giả định khả năng được bám theo docs official.
- **Mở rộng curated**: Nội dung marketplace/community chỉ được thêm sau khi qua schema + quality check.
- **Ổn định đa nền tảng**: Ưu tiên link (`symlink`/`junction`), tự động fallback sang sync-copy khi cần.

## Cấu trúc repo
- `packages/coordinator-cli` - CLI Node.js (`agent-coordinator`)
- `standards` - tài nguyên chuẩn (`skills`, `workflows`, `mcp`, `agents`)
- `adapters` - metadata mapping theo agent
- `compatibility` - ma trận hỗ trợ và giới hạn
- `scripts` - script setup cho PowerShell và shell

## Agent hỗ trợ
- Claude Code
- OpenAI Codex CLI
- Qwen Code
- Antigravity CLI 2.0

Xem `compatibility/matrix.json` để biết nguồn docs và mức xác minh.

## Bắt đầu nhanh

### Yêu cầu
- Node.js `>=18`

### Setup (PowerShell)
```powershell
./scripts/setup.ps1
```

### Setup (Linux/macOS)
```bash
sh ./scripts/setup.sh
```

### Setup trực tiếp
```bash
node packages/coordinator-cli/bin/ai-coordinator.js init --mode auto --agents all
node packages/coordinator-cli/bin/ai-coordinator.js doctor
```

## Branding CLI
CLI có banner/logo dạng text, icon trạng thái, và thông tin thương hiệu:
- `https://tdphat.io.vn/`

## Các lệnh
- `init` - khởi tạo config/state và apply assets theo agent
- `link` - ép chế độ link/junction
- `sync` - ép chế độ copy/sync
- `doctor [--json] [--verbose] [--strict]` - kiểm tra trạng thái, discoverability, docs sources, capabilities, và mức xác minh (`verified`, `partial`, `assumed`); `--strict` trả về mã lỗi nếu có agent chưa đạt `verified`
- `list` - liệt kê assets đã có và backup ids
- `update` - apply lại standards hiện tại
- `priority` - xem hoặc đặt thứ tự ưu tiên theo agent
- `backup` - tạo snapshot trước thay đổi
- `restore` - phục hồi từ backup gần nhất hoặc backup cụ thể
- `remove` - gỡ assets do coordinator quản lý

## Chiến lược layout theo adapter
- Tất cả agent hỗ trợ dùng layout theo adapter để tùy biến cách deploy mà vẫn giữ cùng một bộ standards nguồn.
- Target được cài vào thư mục con `ai-coordinator` để không ghi đè thư mục native của từng CLI tool.
- Layout chuyên biệt hiện tại:
  - Codex skills được đóng gói dạng thư mục (`<skill>/SKILL.md` + `agents/openai.yaml`) để tăng khả năng discover trong giao diện kiểu marketplace.
  - Claude, Qwen và Antigravity hiện dùng layout chuẩn dạng cây thư mục.

## Mô hình ưu tiên
Thứ tự mặc định:

`agent_global < coordinator_shared < project_local < user_override`

Ví dụ set theo agent:
```bash
node packages/coordinator-cli/bin/ai-coordinator.js priority --agent claude --order agent_global,coordinator_shared,project_local,user_override
```

## Catalog tài nguyên
Repo đi kèm bộ prompt/workflow chi tiết để đi từ ý tưởng đến production:
- Skills: backend, frontend, testing, review, devops, security, data, incident response
- Workflows: feature delivery, bugfix, architecture decision, release hardening, migration, postmortem
- MCP presets: local-safe baseline, provider placeholders, team collaboration
- Agent profiles: backend architect, QA guardian, incident commander

Prompt được viết bằng tiếng Anh và có metadata chuẩn (`id`, `title`, `description`, `scope`, `inputs`, `outputs`, `constraints`, `supported_agents`, `degradation_mode`, `source`).

## Validation và an toàn
- Standards được validate trước khi apply (`init`, `link`, `sync`, `update`).
- Snapshot backup được tạo trước mỗi lần áp dụng.
- Nếu apply lỗi, hệ thống auto-restore từ backup.

## Hành vi đa nền tảng
- `--mode auto`: thử link trước, lỗi thì fallback sync.
- `--mode link`: bắt buộc link/junction, lỗi nếu môi trường không hỗ trợ.
- `--mode sync`: chỉ dùng copy/sync có quản lý.

## Nguồn docs chính thức
- Claude: `https://code.claude.com/docs/en/claude-directory`
- Codex: `https://developers.openai.com/codex/config-basic`
- Qwen: `https://qwenlm.github.io/qwen-code-docs/en/users/configuration/settings/`
- Antigravity: `https://antigravity.google/docs/cli-overview`

## Lưu ý bảo mật
- Không lưu credentials trong file của repo.
- MCP provider presets chỉ chứa tên biến môi trường, không chứa key thực.
