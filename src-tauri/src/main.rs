// 阻止 release 构建弹出控制台窗口（Windows）
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    pomodoro_calendar_lib::run()
}
