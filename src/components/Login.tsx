type Props = {
    signInWithGoogle: () => Promise<void>;
};

export default function Login({ signInWithGoogle }: Props) {
    return (
        <div className="center">
            <div className="card authCard">
                <h1 className="authTitle">Вход</h1>
                <div className="authActions">
                    <button className="btn btn-primary btn-lg" onClick={signInWithGoogle}>
                        <img
                            className="gIcon"
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt=""
                            width={18}
                            height={18}
                        />
                        Войти через Google
                    </button>
                </div>
            </div>
        </div>
    );
}
