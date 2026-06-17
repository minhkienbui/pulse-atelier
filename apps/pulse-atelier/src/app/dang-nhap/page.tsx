"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth-store";

type AuthMode = "login" | "register";

function fieldClass() {
  return "mt-2 min-h-11 w-full rounded-lg border border-line bg-graphite px-3 text-sm text-frost outline-none placeholder:text-steel/70 focus:border-pulse";
}

export default function LoginPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerAddress, setRegisterAddress] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = await login(loginEmail, loginPassword);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(result.user.role === "admin" ? "/admin" : "/tai-khoan");
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (registerPassword !== registerPasswordConfirm) {
      setError("Xac nhan mat khau khong khop.");
      return;
    }

    const result = await register({
      name: registerName,
      email: registerEmail,
      phone: registerPhone,
      address: registerAddress,
      password: registerPassword,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push("/tai-khoan");
  };

  return (
    <CustomerShell>
      <section className="shell py-12">
        <Badge variant="mint">Tai khoan</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-frost">Dang nhap hoac dang ky</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
          Truy cap tai khoan de theo doi don hang, luu thong tin giao hang va quan ly ho so mua sam.
        </p>
      </section>

      <section className="shell grid gap-5 pb-12 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-lg border border-line bg-panel p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-graphite p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`min-h-10 rounded-md text-sm font-semibold transition-colors ${
                mode === "login" ? "bg-pulse text-obsidian" : "text-steel hover:text-frost"
              }`}
            >
              Dang nhap
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`min-h-10 rounded-md text-sm font-semibold transition-colors ${
                mode === "register" ? "bg-pulse text-obsidian" : "text-steel hover:text-frost"
              }`}
            >
              Dang ky
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-pulse/25 bg-pulse/10 text-pulse">
                  <LogIn size={22} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-frost">Dang nhap</h2>
                  <p className="mt-1 text-sm text-steel">Nhap email va mat khau cua ban.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <label>
                  <span className="text-sm font-semibold text-steel">Email</span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    className={fieldClass()}
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span className="text-sm font-semibold text-steel">Mat khau</span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className={fieldClass()}
                    autoComplete="current-password"
                  />
                </label>
              </div>

              {error ? <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}

              <Button type="submit" className="mt-6 w-full" leftIcon={<LogIn size={16} />}>
                Dang nhap
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-pulse/25 bg-pulse/10 text-pulse">
                  <UserPlus size={22} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-frost">Dang ky tai khoan</h2>
                  <p className="mt-1 text-sm text-steel">Tao ho so mua sam va thong tin giao hang cua ban.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-steel">Ho ten</span>
                  <input
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                    className={fieldClass()}
                    autoComplete="name"
                  />
                </label>
                <label>
                  <span className="text-sm font-semibold text-steel">Email</span>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    className={fieldClass()}
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span className="text-sm font-semibold text-steel">Dien thoai</span>
                  <input
                    value={registerPhone}
                    onChange={(event) => setRegisterPhone(event.target.value)}
                    className={fieldClass()}
                    autoComplete="tel"
                  />
                </label>
                <label>
                  <span className="text-sm font-semibold text-steel">Mat khau</span>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    className={fieldClass()}
                    autoComplete="new-password"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-steel">Dia chi</span>
                  <textarea
                    value={registerAddress}
                    onChange={(event) => setRegisterAddress(event.target.value)}
                    rows={3}
                    className={`${fieldClass()} py-3`}
                    autoComplete="street-address"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-steel">Xac nhan mat khau</span>
                  <input
                    type="password"
                    value={registerPasswordConfirm}
                    onChange={(event) => setRegisterPasswordConfirm(event.target.value)}
                    className={fieldClass()}
                    autoComplete="new-password"
                  />
                </label>
              </div>

              {error ? <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}

              <Button type="submit" className="mt-6 w-full" leftIcon={<UserPlus size={16} />}>
                Dang ky
              </Button>
            </form>
          )}
        </div>

        <aside className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-xl font-semibold text-frost">Trang thai hien tai</h2>
          {role !== "guest" && user ? (
            <>
              <p className="mt-2 text-sm leading-6 text-steel">
                {user.name} dang dang nhap voi vai tro <span className="font-semibold text-frost">{role}</span>.
              </p>
              <Button
                className="mt-5 w-full"
                variant="secondary"
                leftIcon={<LogOut size={16} />}
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Dang xuat
              </Button>
            </>
          ) : (
            <p className="mt-2 text-sm leading-6 text-steel">
              Ban chua dang nhap. Hay dang nhap hoac tao tai khoan moi de tiep tuc.
            </p>
          )}
        </aside>
      </section>
    </CustomerShell>
  );
}
