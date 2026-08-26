#![no_std]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

/// Horizonte maximo simulavel, em meses (30 anos). Mantido em sincronia com
/// `MAX_MESES` no lado TypeScript (src/wasm/engine.ts).
pub const MAX_MESES: i32 = 360;

static mut BUFFER: [f64; MAX_MESES as usize] = [0.0; MAX_MESES as usize];

/// Offset do buffer de resultados na memoria linear do modulo. O lado JS le
/// `n` valores f64 a partir daqui via `new Float64Array(memory.buffer, ptr, n)`.
#[no_mangle]
pub extern "C" fn buffer_ptr() -> i32 {
    core::ptr::addr_of!(BUFFER) as i32
}

/// Simula o saldo mes a mes de um investimento com aporte mensal fixo e
/// juros compostos (taxa mensal aproximada como taxa_anual / 12). Escreve
/// os saldos no buffer estatico e retorna quantos meses foram escritos —
/// sempre entre 0 e MAX_MESES, mesmo que `meses` peca mais que isso ou
/// venha invalido (negativo, NaN, infinito).
#[no_mangle]
pub extern "C" fn simular(valor_inicial: f64, aporte_mensal: f64, taxa_anual_pct: f64, meses: i32) -> i32 {
    if !valor_inicial.is_finite() || !aporte_mensal.is_finite() || !taxa_anual_pct.is_finite() {
        return 0;
    }
    if valor_inicial < 0.0 || aporte_mensal < 0.0 || taxa_anual_pct < 0.0 {
        return 0;
    }

    let n = meses.clamp(0, MAX_MESES) as usize;
    let taxa_mensal = taxa_anual_pct / 100.0 / 12.0;

    let mut saldo = valor_inicial;
    unsafe {
        for i in 0..n {
            saldo = saldo * (1.0 + taxa_mensal) + aporte_mensal;
            BUFFER[i] = saldo;
        }
    }
    n as i32
}
