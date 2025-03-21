let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_4.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_6.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_6.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_6.get(state.dtor)(state.a, state.b);
                state.a = 0;
                CLOSURE_DTORS.unregister(state);
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}
/**
 * activates debug logging
 */
export function set_debug_log() {
    wasm.set_debug_log();
}

/**
 * sets up a leptos context for rendering FTML documents or fragments.
 * If a context already exists, does nothing, so is cheap to call
 * [render_document] and [render_fragment] also inject a context
 * iff none already exists, so this is optional in every case.
 * @param {HTMLElement} to
 * @param {LeptosContinuation} children
 * @param {(uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null} [on_section]
 * @param {(uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null} [on_section_title]
 * @param {(uri: DocumentElementURI,kind:ParagraphKind) => (LeptosContinuation | undefined) | null} [on_paragraph]
 * @param {(uri: DocumentURI) => (LeptosContinuation | undefined) | null} [on_inputref]
 * @param {(uri: DocumentElementURI) => (LeptosContinuation | undefined) | null} [on_slide]
 * @param {ExerciseOption | null} [exercise_opts]
 * @param {(r:ExerciseResponse) => void | null} [on_exercise]
 * @returns {FTMLMountHandle}
 */
export function ftml_setup(to, children, on_section, on_section_title, on_paragraph, on_inputref, on_slide, exercise_opts, on_exercise) {
    const ret = wasm.ftml_setup(to, children, isLikeNone(on_section) ? 0 : addToExternrefTable0(on_section), isLikeNone(on_section_title) ? 0 : addToExternrefTable0(on_section_title), isLikeNone(on_paragraph) ? 0 : addToExternrefTable0(on_paragraph), isLikeNone(on_inputref) ? 0 : addToExternrefTable0(on_inputref), isLikeNone(on_slide) ? 0 : addToExternrefTable0(on_slide), isLikeNone(exercise_opts) ? 0 : addToExternrefTable0(exercise_opts), isLikeNone(on_exercise) ? 0 : addToExternrefTable0(on_exercise));
    return FTMLMountHandle.__wrap(ret);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_4.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * render an FTML document to the provided element
 * #### Errors
 * @param {HTMLElement} to
 * @param {DocumentOptions} document
 * @param {LeptosContext | null} [context]
 * @param {(uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null} [on_section]
 * @param {(uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null} [on_section_title]
 * @param {(uri: DocumentElementURI,kind:ParagraphKind) => (LeptosContinuation | undefined) | null} [on_paragraph]
 * @param {(uri: DocumentURI) => (LeptosContinuation | undefined) | null} [on_inputref]
 * @param {(uri: DocumentElementURI) => (LeptosContinuation | undefined) | null} [on_slide]
 * @param {ExerciseOption | null} [exercise_opts]
 * @param {(r:ExerciseResponse) => void | null} [on_exercise]
 * @returns {FTMLMountHandle}
 */
export function render_document(to, document, context, on_section, on_section_title, on_paragraph, on_inputref, on_slide, exercise_opts, on_exercise) {
    let ptr0 = 0;
    if (!isLikeNone(context)) {
        _assertClass(context, LeptosContext);
        ptr0 = context.__destroy_into_raw();
    }
    const ret = wasm.render_document(to, document, ptr0, isLikeNone(on_section) ? 0 : addToExternrefTable0(on_section), isLikeNone(on_section_title) ? 0 : addToExternrefTable0(on_section_title), isLikeNone(on_paragraph) ? 0 : addToExternrefTable0(on_paragraph), isLikeNone(on_inputref) ? 0 : addToExternrefTable0(on_inputref), isLikeNone(on_slide) ? 0 : addToExternrefTable0(on_slide), isLikeNone(exercise_opts) ? 0 : addToExternrefTable0(exercise_opts), isLikeNone(on_exercise) ? 0 : addToExternrefTable0(on_exercise));
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return FTMLMountHandle.__wrap(ret[0]);
}

/**
 * render an FTML document fragment to the provided element
 * #### Errors
 * @param {HTMLElement} to
 * @param {FragmentOptions} fragment
 * @param {LeptosContext | null} [context]
 * @param {(uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null} [on_section]
 * @param {(uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null} [on_section_title]
 * @param {(uri: DocumentElementURI,kind:ParagraphKind) => (LeptosContinuation | undefined) | null} [on_paragraph]
 * @param {(uri: DocumentURI) => (LeptosContinuation | undefined) | null} [on_inputref]
 * @param {(uri: DocumentElementURI) => (LeptosContinuation | undefined) | null} [on_slide]
 * @param {ExerciseOption | null} [exercise_opts]
 * @param {(r:ExerciseResponse) => void | null} [on_exercise]
 * @returns {FTMLMountHandle}
 */
export function render_fragment(to, fragment, context, on_section, on_section_title, on_paragraph, on_inputref, on_slide, exercise_opts, on_exercise) {
    let ptr0 = 0;
    if (!isLikeNone(context)) {
        _assertClass(context, LeptosContext);
        ptr0 = context.__destroy_into_raw();
    }
    const ret = wasm.render_fragment(to, fragment, ptr0, isLikeNone(on_section) ? 0 : addToExternrefTable0(on_section), isLikeNone(on_section_title) ? 0 : addToExternrefTable0(on_section_title), isLikeNone(on_paragraph) ? 0 : addToExternrefTable0(on_paragraph), isLikeNone(on_inputref) ? 0 : addToExternrefTable0(on_inputref), isLikeNone(on_slide) ? 0 : addToExternrefTable0(on_slide), isLikeNone(exercise_opts) ? 0 : addToExternrefTable0(exercise_opts), isLikeNone(on_exercise) ? 0 : addToExternrefTable0(on_exercise));
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return FTMLMountHandle.__wrap(ret[0]);
}

/**
 * sets the server url used to the provided one; by default `https://flams.mathhub.info`.
 * @param {string} server_url
 */
export function set_server_url(server_url) {
    const ptr0 = passStringToWasm0(server_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_server_url(ptr0, len0);
}

/**
 * gets the current server url
 * @returns {string}
 */
export function get_server_url() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.get_server_url();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

function __wbg_adapter_58(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h4ed24e189a98788b(arg0, arg1);
}

function __wbg_adapter_63(arg0, arg1, arg2) {
    wasm.closure568_externref_shim(arg0, arg1, arg2);
}

function __wbg_adapter_74(arg0, arg1, arg2) {
    const ret = wasm.closure995_externref_shim(arg0, arg1, arg2);
    return ret >>> 0;
}

function __wbg_adapter_151(arg0, arg1, arg2, arg3) {
    wasm.closure826_externref_shim(arg0, arg1, arg2, arg3);
}

const __wbindgen_enum_ReadableStreamType = ["bytes"];

const __wbindgen_enum_ScrollBehavior = ["auto", "instant", "smooth"];

const __wbindgen_enum_ScrollLogicalPosition = ["start", "center", "end", "nearest"];

const ExerciseFeedbackFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_exercisefeedback_free(ptr >>> 0, 1));

export class ExerciseFeedback {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ExerciseFeedback.prototype);
        obj.__wbg_ptr = ptr;
        ExerciseFeedbackFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExerciseFeedbackFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_exercisefeedback_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get correct() {
        const ret = wasm.__wbg_get_exercisefeedback_correct(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set correct(arg0) {
        wasm.__wbg_set_exercisefeedback_correct(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get score_fraction() {
        const ret = wasm.__wbg_get_exercisefeedback_score_fraction(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set score_fraction(arg0) {
        wasm.__wbg_set_exercisefeedback_score_fraction(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} s
     * @returns {ExerciseFeedback | undefined}
     */
    static from_jstring(s) {
        const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.exercisefeedback_from_jstring(ptr0, len0);
        return ret === 0 ? undefined : ExerciseFeedback.__wrap(ret);
    }
    /**
     * @returns {string | undefined}
     */
    to_jstring() {
        const ret = wasm.exercisefeedback_to_jstring(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
}

const FTMLMountHandleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_ftmlmounthandle_free(ptr >>> 0, 1));

export class FTMLMountHandle {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FTMLMountHandle.prototype);
        obj.__wbg_ptr = ptr;
        FTMLMountHandleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FTMLMountHandleFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ftmlmounthandle_free(ptr, 0);
    }
    /**
     * unmounts the view and cleans up the reactive system.
     * Not calling this is a memory leak
     */
    unmount() {
        wasm.ftmlmounthandle_unmount(this.__wbg_ptr);
    }
}

const IntoUnderlyingByteSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingbytesource_free(ptr >>> 0, 1));

export class IntoUnderlyingByteSource {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingByteSourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingbytesource_free(ptr, 0);
    }
    /**
     * @returns {ReadableStreamType}
     */
    get type() {
        const ret = wasm.intounderlyingbytesource_type(this.__wbg_ptr);
        return __wbindgen_enum_ReadableStreamType[ret];
    }
    /**
     * @returns {number}
     */
    get autoAllocateChunkSize() {
        const ret = wasm.intounderlyingbytesource_autoAllocateChunkSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {ReadableByteStreamController} controller
     */
    start(controller) {
        wasm.intounderlyingbytesource_start(this.__wbg_ptr, controller);
    }
    /**
     * @param {ReadableByteStreamController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingbytesource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingbytesource_cancel(ptr);
    }
}

const IntoUnderlyingSinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsink_free(ptr >>> 0, 1));

export class IntoUnderlyingSink {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSinkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsink_free(ptr, 0);
    }
    /**
     * @param {any} chunk
     * @returns {Promise<any>}
     */
    write(chunk) {
        const ret = wasm.intounderlyingsink_write(this.__wbg_ptr, chunk);
        return ret;
    }
    /**
     * @returns {Promise<any>}
     */
    close() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_close(ptr);
        return ret;
    }
    /**
     * @param {any} reason
     * @returns {Promise<any>}
     */
    abort(reason) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_abort(ptr, reason);
        return ret;
    }
}

const IntoUnderlyingSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsource_free(ptr >>> 0, 1));

export class IntoUnderlyingSource {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsource_free(ptr, 0);
    }
    /**
     * @param {ReadableStreamDefaultController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingsource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingsource_cancel(ptr);
    }
}

const LeptosContextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_leptoscontext_free(ptr >>> 0, 1));

export class LeptosContext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(LeptosContext.prototype);
        obj.__wbg_ptr = ptr;
        LeptosContextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LeptosContextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_leptoscontext_free(ptr, 0);
    }
    /**
     * Cleans up the reactive system.
     * Not calling this is a memory leak
     */
    cleanup() {
        wasm.leptoscontext_cleanup(this.__wbg_ptr);
    }
    /**
     * @returns {LeptosContext}
     */
    wasm_clone() {
        const ret = wasm.leptoscontext_wasm_clone(this.__wbg_ptr);
        return LeptosContext.__wrap(ret);
    }
}

const SolutionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_solutions_free(ptr >>> 0, 1));

export class Solutions {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Solutions.prototype);
        obj.__wbg_ptr = ptr;
        SolutionsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SolutionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_solutions_free(ptr, 0);
    }
    /**
     * @param {string} s
     * @returns {Solutions | undefined}
     */
    static from_jstring(s) {
        const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.solutions_from_jstring(ptr0, len0);
        return ret === 0 ? undefined : Solutions.__wrap(ret);
    }
    /**
     * @returns {string | undefined}
     */
    to_jstring() {
        const ret = wasm.solutions_to_jstring(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {ExerciseResponse} response
     * @returns {ExerciseFeedback | undefined}
     */
    check_response(response) {
        const ret = wasm.solutions_check_response(this.__wbg_ptr, response);
        return ret === 0 ? undefined : ExerciseFeedback.__wrap(ret);
    }
}

export function __wbg_String_8f0eb39a4a4c2f66(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_addEventListener_7b8506ed3daef7d5() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.addEventListener(getStringFromWasm0(arg1, arg2), arg3, arg4 !== 0);
}, arguments) };

export function __wbg_addEventListener_90e553fdce254421() { return handleError(function (arg0, arg1, arg2, arg3) {
    arg0.addEventListener(getStringFromWasm0(arg1, arg2), arg3);
}, arguments) };

export function __wbg_add_21e24dddfda69f1c() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.add(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_add_9b5191a4a4f767dc() { return handleError(function (arg0, arg1, arg2) {
    arg0.add(getStringFromWasm0(arg1, arg2));
}, arguments) };

export function __wbg_altKey_c33c03aed82e4275(arg0) {
    const ret = arg0.altKey;
    return ret;
};

export function __wbg_appendChild_8204974b7328bf98() { return handleError(function (arg0, arg1) {
    const ret = arg0.appendChild(arg1);
    return ret;
}, arguments) };

export function __wbg_body_942ea927546a04ba(arg0) {
    const ret = arg0.body;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_bottom_79b03e9c3d6f4e1e(arg0) {
    const ret = arg0.bottom;
    return ret;
};

export function __wbg_buffer_09165b52af8c5237(arg0) {
    const ret = arg0.buffer;
    return ret;
};

export function __wbg_buffer_609cc3eee51ed158(arg0) {
    const ret = arg0.buffer;
    return ret;
};

export function __wbg_byobRequest_77d9adf63337edfb(arg0) {
    const ret = arg0.byobRequest;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_byteLength_e674b853d9c77e1d(arg0) {
    const ret = arg0.byteLength;
    return ret;
};

export function __wbg_byteOffset_fd862df290ef848d(arg0) {
    const ret = arg0.byteOffset;
    return ret;
};

export function __wbg_call_672a4d21634d4a24() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments) };

export function __wbg_call_7cccdd69e0791ae2() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.call(arg1, arg2);
    return ret;
}, arguments) };

export function __wbg_call_833bed5770ea2041() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = arg0.call(arg1, arg2, arg3);
    return ret;
}, arguments) };

export function __wbg_cancelAnimationFrame_089b48301c362fde() { return handleError(function (arg0, arg1) {
    arg0.cancelAnimationFrame(arg1);
}, arguments) };

export function __wbg_cancelBubble_2e66f509cdea4d7e(arg0) {
    const ret = arg0.cancelBubble;
    return ret;
};

export function __wbg_checked_0591091c28a685f0(arg0) {
    const ret = arg0.checked;
    return ret;
};

export function __wbg_childElementCount_385229cd432147ba(arg0) {
    const ret = arg0.childElementCount;
    return ret;
};

export function __wbg_childNodes_c4423003f3a9441f(arg0) {
    const ret = arg0.childNodes;
    return ret;
};

export function __wbg_classList_3fa995ef71da9e8e(arg0) {
    const ret = arg0.classList;
    return ret;
};

export function __wbg_clearTimeout_b2651b7485c58446(arg0, arg1) {
    arg0.clearTimeout(arg1);
};

export function __wbg_clientX_5eb380a5f1fec6fd(arg0) {
    const ret = arg0.clientX;
    return ret;
};

export function __wbg_clientY_d8b9c7f0c4e2e677(arg0) {
    const ret = arg0.clientY;
    return ret;
};

export function __wbg_cloneNode_a8ce4052a2c37536() { return handleError(function (arg0, arg1) {
    const ret = arg0.cloneNode(arg1 !== 0);
    return ret;
}, arguments) };

export function __wbg_cloneNode_e35b333b87d51340() { return handleError(function (arg0) {
    const ret = arg0.cloneNode();
    return ret;
}, arguments) };

export function __wbg_close_304cc1fef3466669() { return handleError(function (arg0) {
    arg0.close();
}, arguments) };

export function __wbg_close_5ce03e29be453811() { return handleError(function (arg0) {
    arg0.close();
}, arguments) };

export function __wbg_code_459c120478e1ab6e(arg0, arg1) {
    const ret = arg1.code;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_composedPath_977ce97a0ef39358(arg0) {
    const ret = arg0.composedPath();
    return ret;
};

export function __wbg_contains_687eea5148ddb87c(arg0, arg1, arg2) {
    const ret = arg0.contains(getStringFromWasm0(arg1, arg2));
    return ret;
};

export function __wbg_content_537e4105afcd9cee(arg0) {
    const ret = arg0.content;
    return ret;
};

export function __wbg_createComment_8b540d4b9d22f212(arg0, arg1, arg2) {
    const ret = arg0.createComment(getStringFromWasm0(arg1, arg2));
    return ret;
};

export function __wbg_createElementNS_914d752e521987da() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    const ret = arg0.createElementNS(arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    return ret;
}, arguments) };

export function __wbg_createElement_8c9931a732ee2fea() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
    return ret;
}, arguments) };

export function __wbg_createTextNode_42af1a9f21bb3360(arg0, arg1, arg2) {
    const ret = arg0.createTextNode(getStringFromWasm0(arg1, arg2));
    return ret;
};

export function __wbg_createTreeWalker_bbbc4929a22c7b56() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = arg0.createTreeWalker(arg1, arg2 >>> 0, arg3);
    return ret;
}, arguments) };

export function __wbg_ctrlKey_1e826e468105ac11(arg0) {
    const ret = arg0.ctrlKey;
    return ret;
};

export function __wbg_deleteProperty_96363d4a1d977c97() { return handleError(function (arg0, arg1) {
    const ret = Reflect.deleteProperty(arg0, arg1);
    return ret;
}, arguments) };

export function __wbg_document_d249400bd7bd996d(arg0) {
    const ret = arg0.document;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_done_769e5ede4b31c67b(arg0) {
    const ret = arg0.done;
    return ret;
};

export function __wbg_enqueue_bb16ba72f537dc9e() { return handleError(function (arg0, arg1) {
    arg0.enqueue(arg1);
}, arguments) };

export function __wbg_entries_3265d4158b33e5dc(arg0) {
    const ret = Object.entries(arg0);
    return ret;
};

export function __wbg_error_524f506f44df1645(arg0) {
    console.error(arg0);
};

export function __wbg_fetch_b7bf320f681242d2(arg0, arg1) {
    const ret = arg0.fetch(arg1);
    return ret;
};

export function __wbg_firstChild_66c0f33e7468faea() { return handleError(function (arg0) {
    const ret = arg0.firstChild();
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

export function __wbg_firstChild_b0603462b5172539(arg0) {
    const ret = arg0.firstChild;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_firstElementChild_d75d385f5abd1414(arg0) {
    const ret = arg0.firstElementChild;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_focus_7d08b55eba7b368d() { return handleError(function (arg0) {
    arg0.focus();
}, arguments) };

export function __wbg_getAttributeNames_d2dd7cba5c74e6de(arg0) {
    const ret = arg0.getAttributeNames();
    return ret;
};

export function __wbg_getAttribute_ea5166be2deba45e(arg0, arg1, arg2, arg3) {
    const ret = arg1.getAttribute(getStringFromWasm0(arg2, arg3));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_getBoundingClientRect_9073b0ff7574d76b(arg0) {
    const ret = arg0.getBoundingClientRect();
    return ret;
};

export function __wbg_getComputedStyle_046dd6472f8e7f1d() { return handleError(function (arg0, arg1) {
    const ret = arg0.getComputedStyle(arg1);
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

export function __wbg_getElementById_f827f0d6648718a8(arg0, arg1, arg2) {
    const ret = arg0.getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_getItem_17f98dee3b43fa7e() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = arg1.getItem(getStringFromWasm0(arg2, arg3));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}, arguments) };

export function __wbg_getPropertyValue_e623c23a05dfb30c() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = arg1.getPropertyValue(getStringFromWasm0(arg2, arg3));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}, arguments) };

export function __wbg_getRandomValues_7dd14472e5bb087d() { return handleError(function (arg0, arg1) {
    globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
}, arguments) };

export function __wbg_get_67b2ba62fc30de12() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments) };

export function __wbg_get_b9b93047fe3cf45b(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
};

export function __wbg_get_e27dfaeb6f46bd45(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_getwithrefkey_1dc361bd10053bfe(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
};

export function __wbg_hash_dd4b49269c385c8a() { return handleError(function (arg0, arg1) {
    const ret = arg1.hash;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}, arguments) };

export function __wbg_head_fa0ce59b81a623f5(arg0) {
    const ret = arg0.head;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_height_592a89ec0fb63726(arg0) {
    const ret = arg0.height;
    return ret;
};

export function __wbg_host_166cb082dae71d08(arg0) {
    const ret = arg0.host;
    return ret;
};

export function __wbg_id_c65402eae48fb242(arg0, arg1) {
    const ret = arg1.id;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_includes_937486a108ec147b(arg0, arg1, arg2) {
    const ret = arg0.includes(arg1, arg2);
    return ret;
};

export function __wbg_innerHeight_05f4225d754a7929() { return handleError(function (arg0) {
    const ret = arg0.innerHeight;
    return ret;
}, arguments) };

export function __wbg_innerWidth_7e0498dbd876d498() { return handleError(function (arg0) {
    const ret = arg0.innerWidth;
    return ret;
}, arguments) };

export function __wbg_insertBefore_c181fb91844cd959() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.insertBefore(arg1, arg2);
    return ret;
}, arguments) };

export function __wbg_instanceof_ArrayBuffer_e14585432e3737fc(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Element_0af65443936d5154(arg0) {
    let result;
    try {
        result = arg0 instanceof Element;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Error_4d54113b22d20306(arg0) {
    let result;
    try {
        result = arg0 instanceof Error;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_HtmlElement_51378c201250b16c(arg0) {
    let result;
    try {
        result = arg0 instanceof HTMLElement;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_HtmlInputElement_12d71bf2d15dd19e(arg0) {
    let result;
    try {
        result = arg0 instanceof HTMLInputElement;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Map_f3469ce2244d2430(arg0) {
    let result;
    try {
        result = arg0 instanceof Map;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Response_f2cc20d9f7dfd644(arg0) {
    let result;
    try {
        result = arg0 instanceof Response;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_ShadowRoot_726578bcd7fa418a(arg0) {
    let result;
    try {
        result = arg0 instanceof ShadowRoot;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Uint8Array_17156bcf118086a9(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Window_def73ea0955fc569(arg0) {
    let result;
    try {
        result = arg0 instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_isArray_a1eab7e0d067391b(arg0) {
    const ret = Array.isArray(arg0);
    return ret;
};

export function __wbg_isSafeInteger_343e2beeeece1bb0(arg0) {
    const ret = Number.isSafeInteger(arg0);
    return ret;
};

export function __wbg_is_c7481c65e7e5df9e(arg0, arg1) {
    const ret = Object.is(arg0, arg1);
    return ret;
};

export function __wbg_iterator_9a24c88df860dc65() {
    const ret = Symbol.iterator;
    return ret;
};

export function __wbg_json_1671bfa3e3625686() { return handleError(function (arg0) {
    const ret = arg0.json();
    return ret;
}, arguments) };

export function __wbg_key_7b5c6cb539be8e13(arg0, arg1) {
    const ret = arg1.key;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_lastChild_fb306e0bb1673f50() { return handleError(function (arg0) {
    const ret = arg0.lastChild();
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

export function __wbg_left_e46801720267b66d(arg0) {
    const ret = arg0.left;
    return ret;
};

export function __wbg_length_a446193dc22c12f8(arg0) {
    const ret = arg0.length;
    return ret;
};

export function __wbg_length_e2d2a49132c1b256(arg0) {
    const ret = arg0.length;
    return ret;
};

export function __wbg_leptoscontext_new(arg0) {
    const ret = LeptosContext.__wrap(arg0);
    return ret;
};

export function __wbg_localStorage_1406c99c39728187() { return handleError(function (arg0) {
    const ret = arg0.localStorage;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

export function __wbg_location_350d99456c2f3693(arg0) {
    const ret = arg0.location;
    return ret;
};

export function __wbg_log_0cc1b7768397bcfe(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export function __wbg_log_c222819a41e063d3(arg0) {
    console.log(arg0);
};

export function __wbg_log_cb9e190acc5753fb(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.log(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export function __wbg_mark_7438147ce31e9d4b(arg0, arg1) {
    performance.mark(getStringFromWasm0(arg0, arg1));
};

export function __wbg_measure_fb7825c11612c823() { return handleError(function (arg0, arg1, arg2, arg3) {
    let deferred0_0;
    let deferred0_1;
    let deferred1_0;
    let deferred1_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        deferred1_0 = arg2;
        deferred1_1 = arg3;
        performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}, arguments) };

export function __wbg_message_97a2af9b89d693a3(arg0) {
    const ret = arg0.message;
    return ret;
};

export function __wbg_metaKey_e1dd47d709a80ce5(arg0) {
    const ret = arg0.metaKey;
    return ret;
};

export function __wbg_name_0b327d569f00ebee(arg0) {
    const ret = arg0.name;
    return ret;
};

export function __wbg_new_018dcc2d6c8c2f6a() { return handleError(function () {
    const ret = new Headers();
    return ret;
}, arguments) };

export function __wbg_new_23a2665fac83c611(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_151(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return ret;
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_new_405e22f390576ce2() {
    const ret = new Object();
    return ret;
};

export function __wbg_new_78feb108b6472713() {
    const ret = new Array();
    return ret;
};

export function __wbg_new_a12002a7f91c75be(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
};

export function __wbg_new_c68d7209be747379(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbg_newnoargs_105ed471475aaf50(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a(arg0, arg1, arg2) {
    const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
    return ret;
};

export function __wbg_newwithstrandinit_06c535e0a867c635() { return handleError(function (arg0, arg1, arg2) {
    const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
    return ret;
}, arguments) };

export function __wbg_nextNode_25ba1415b9dee2d2() { return handleError(function (arg0) {
    const ret = arg0.nextNode();
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

export function __wbg_nextSibling_f17f68d089a20939(arg0) {
    const ret = arg0.nextSibling;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_next_25feadfc0913fea9(arg0) {
    const ret = arg0.next;
    return ret;
};

export function __wbg_next_6574e1a8a62d1055() { return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
}, arguments) };

export function __wbg_nodeType_5e1153141daac26a(arg0) {
    const ret = arg0.nodeType;
    return ret;
};

export function __wbg_offsetHeight_4b2bc94377e10979(arg0) {
    const ret = arg0.offsetHeight;
    return ret;
};

export function __wbg_offsetWidth_3cf4cc9df4051078(arg0) {
    const ret = arg0.offsetWidth;
    return ret;
};

export function __wbg_outerHTML_69175e02bad1633b(arg0, arg1) {
    const ret = arg1.outerHTML;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_parentElement_be28a1a931f9c9b7(arg0) {
    const ret = arg0.parentElement;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_parentNode_9de97a0e7973ea4e(arg0) {
    const ret = arg0.parentNode;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_parseFloat_7e07eec2726e65d0(arg0, arg1) {
    const ret = Number.parseFloat(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbg_prepend_536a5a2dc0b99b47() { return handleError(function (arg0, arg1) {
    arg0.prepend(arg1);
}, arguments) };

export function __wbg_preventDefault_c2314fd813c02b3c(arg0) {
    arg0.preventDefault();
};

export function __wbg_previousNode_37d8248390d42609() { return handleError(function (arg0) {
    const ret = arg0.previousNode();
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

export function __wbg_querySelector_c69f8b573958906b() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.querySelector(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

export function __wbg_querySelector_d638ba83a95cf66a() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.querySelector(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

export function __wbg_queueMicrotask_97d92b4fcc8a61c5(arg0) {
    queueMicrotask(arg0);
};

export function __wbg_queueMicrotask_d3219def82552485(arg0) {
    const ret = arg0.queueMicrotask;
    return ret;
};

export function __wbg_removeAttribute_e419cd6726b4c62f() { return handleError(function (arg0, arg1, arg2) {
    arg0.removeAttribute(getStringFromWasm0(arg1, arg2));
}, arguments) };

export function __wbg_removeChild_841bf1dc802c0a2c() { return handleError(function (arg0, arg1) {
    const ret = arg0.removeChild(arg1);
    return ret;
}, arguments) };

export function __wbg_removeEventListener_056dfe8c3d6c58f9() { return handleError(function (arg0, arg1, arg2, arg3) {
    arg0.removeEventListener(getStringFromWasm0(arg1, arg2), arg3);
}, arguments) };

export function __wbg_removeEventListener_d365ee1c2a7b08f0() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.removeEventListener(getStringFromWasm0(arg1, arg2), arg3, arg4 !== 0);
}, arguments) };

export function __wbg_removeItem_9d2669ee3bba6f7d() { return handleError(function (arg0, arg1, arg2) {
    arg0.removeItem(getStringFromWasm0(arg1, arg2));
}, arguments) };

export function __wbg_removeProperty_0e85471f4dfc00ae() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = arg1.removeProperty(getStringFromWasm0(arg2, arg3));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}, arguments) };

export function __wbg_remove_282d941ca37d0c63() { return handleError(function (arg0, arg1, arg2) {
    arg0.remove(getStringFromWasm0(arg1, arg2));
}, arguments) };

export function __wbg_remove_511c5d99ecacc988() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.remove(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_remove_e2d2659f3128c045(arg0) {
    arg0.remove();
};

export function __wbg_remove_efb062ab554e1fbd(arg0) {
    arg0.remove();
};

export function __wbg_requestAnimationFrame_d7fd890aaefc3246() { return handleError(function (arg0, arg1) {
    const ret = arg0.requestAnimationFrame(arg1);
    return ret;
}, arguments) };

export function __wbg_resolve_4851785c9c5f573d(arg0) {
    const ret = Promise.resolve(arg0);
    return ret;
};

export function __wbg_respond_1f279fa9f8edcb1c() { return handleError(function (arg0, arg1) {
    arg0.respond(arg1 >>> 0);
}, arguments) };

export function __wbg_right_54416a875852cab1(arg0) {
    const ret = arg0.right;
    return ret;
};

export function __wbg_root_226fe354ef466dff(arg0) {
    const ret = arg0.root;
    return ret;
};

export function __wbg_scrollIntoView_281bcffa62eea382(arg0, arg1) {
    arg0.scrollIntoView(arg1 !== 0);
};

export function __wbg_scrollIntoView_c8c0faa10ba6968a(arg0, arg1) {
    arg0.scrollIntoView(arg1);
};

export function __wbg_scrollIntoView_d13094450218e94b(arg0) {
    arg0.scrollIntoView();
};

export function __wbg_scrollLeft_b195ce13f48fdfef(arg0) {
    const ret = arg0.scrollLeft;
    return ret;
};

export function __wbg_scrollTop_8a5774351f38b4cb(arg0) {
    const ret = arg0.scrollTop;
    return ret;
};

export function __wbg_setAttribute_2704501201f15687() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_setItem_212ecc915942ab0a() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_setProperty_f2cf326652b9a713() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_setTimeout_f2fe5af8e3debeb3() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.setTimeout(arg1, arg2);
    return ret;
}, arguments) };

export function __wbg_set_37837023f3d740e8(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
};

export function __wbg_set_3f1d0b984ed272ed(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
};

export function __wbg_set_65595bdd868b3009(arg0, arg1, arg2) {
    arg0.set(arg1, arg2 >>> 0);
};

export function __wbg_set_bb8cecf6a62b9f46() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(arg0, arg1, arg2);
    return ret;
}, arguments) };

export function __wbg_setacceptnode_e6c2cbf68b17a7a9(arg0, arg1) {
    arg0.acceptNode = arg1;
};

export function __wbg_setbehavior_7927939a0bc6d379(arg0, arg1) {
    arg0.behavior = __wbindgen_enum_ScrollBehavior[arg1];
};

export function __wbg_setblock_63cb5ef6332c2d9f(arg0, arg1) {
    arg0.block = __wbindgen_enum_ScrollLogicalPosition[arg1];
};

export function __wbg_setcurrentNode_333ccad48529b94b(arg0, arg1) {
    arg0.currentNode = arg1;
};

export function __wbg_setheaders_834c0bdb6a8949ad(arg0, arg1) {
    arg0.headers = arg1;
};

export function __wbg_setinnerHTML_31bde41f835786f7(arg0, arg1, arg2) {
    arg0.innerHTML = getStringFromWasm0(arg1, arg2);
};

export function __wbg_setmethod_3c5280fe5d890842(arg0, arg1, arg2) {
    arg0.method = getStringFromWasm0(arg1, arg2);
};

export function __wbg_setnodeValue_58cb1b2f6b6c33d2(arg0, arg1, arg2) {
    arg0.nodeValue = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
};

export function __wbg_setscrollLeft_4a32d6dd95043f07(arg0, arg1) {
    arg0.scrollLeft = arg1;
};

export function __wbg_setscrollTop_f15a2d1f8cd45571(arg0, arg1) {
    arg0.scrollTop = arg1;
};

export function __wbg_settextContent_d29397f7b994d314(arg0, arg1, arg2) {
    arg0.textContent = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
};

export function __wbg_static_accessor_GLOBAL_88a902d13a557d07() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_SELF_37c5d418e4bf5819() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_WINDOW_5de37043a91a9c40() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_stopPropagation_11d220a858e5e0fb(arg0) {
    arg0.stopPropagation();
};

export function __wbg_style_fb30c14e5815805c(arg0) {
    const ret = arg0.style;
    return ret;
};

export function __wbg_tagName_b284ab9c1479c38d(arg0, arg1) {
    const ret = arg1.tagName;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_target_0a62d9d79a2a1ede(arg0) {
    const ret = arg0.target;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_then_44b73946d2fb3e7d(arg0, arg1) {
    const ret = arg0.then(arg1);
    return ret;
};

export function __wbg_then_48b406749878a531(arg0, arg1, arg2) {
    const ret = arg0.then(arg1, arg2);
    return ret;
};

export function __wbg_toString_c813bbd34d063839(arg0) {
    const ret = arg0.toString();
    return ret;
};

export function __wbg_top_ec9fceb1f030f2ea(arg0) {
    const ret = arg0.top;
    return ret;
};

export function __wbg_value_91cbf0dd3ab84c1e(arg0, arg1) {
    const ret = arg1.value;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_value_cd1ffa7b1ab794f1(arg0) {
    const ret = arg0.value;
    return ret;
};

export function __wbg_view_fd8a56e8983f448d(arg0) {
    const ret = arg0.view;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_width_f0759bd8bad335bd(arg0) {
    const ret = arg0.width;
    return ret;
};

export function __wbg_x_27b56c5721e559a8(arg0) {
    const ret = arg0.x;
    return ret;
};

export function __wbg_y_be10a4f665290032(arg0) {
    const ret = arg0.y;
    return ret;
};

export function __wbindgen_as_number(arg0) {
    const ret = +arg0;
    return ret;
};

export function __wbindgen_bigint_from_i64(arg0) {
    const ret = arg0;
    return ret;
};

export function __wbindgen_bigint_from_u64(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return ret;
};

export function __wbindgen_bigint_get_as_i64(arg0, arg1) {
    const v = arg1;
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbindgen_boolean_get(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbindgen_cb_drop(arg0) {
    const obj = arg0.original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbindgen_closure_wrapper1252(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 569, __wbg_adapter_58);
    return ret;
};

export function __wbindgen_closure_wrapper1625(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 569, __wbg_adapter_58);
    return ret;
};

export function __wbindgen_closure_wrapper4142(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 569, __wbg_adapter_63);
    return ret;
};

export function __wbindgen_closure_wrapper4608(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 569, __wbg_adapter_63);
    return ret;
};

export function __wbindgen_closure_wrapper5413(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 569, __wbg_adapter_63);
    return ret;
};

export function __wbindgen_closure_wrapper7008(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 569, __wbg_adapter_63);
    return ret;
};

export function __wbindgen_closure_wrapper7848(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 569, __wbg_adapter_63);
    return ret;
};

export function __wbindgen_closure_wrapper7959(arg0, arg1, arg2) {
    const ret = makeClosure(arg0, arg1, 569, __wbg_adapter_74);
    return ret;
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbindgen_in(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
};

export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_export_4;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

export function __wbindgen_is_bigint(arg0) {
    const ret = typeof(arg0) === 'bigint';
    return ret;
};

export function __wbindgen_is_falsy(arg0) {
    const ret = !arg0;
    return ret;
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
};

export function __wbindgen_is_null(arg0) {
    const ret = arg0 === null;
    return ret;
};

export function __wbindgen_is_object(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
};

export function __wbindgen_is_undefined(arg0) {
    const ret = arg0 === undefined;
    return ret;
};

export function __wbindgen_json_serialize(arg0, arg1) {
    const obj = arg1;
    const ret = JSON.stringify(obj === undefined ? null : obj);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_jsval_eq(arg0, arg1) {
    const ret = arg0 === arg1;
    return ret;
};

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return ret;
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return ret;
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

