export function ThemeScript() {
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: `
          (function() {
            try {
              var savedTheme = localStorage.getItem('theme');
              var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              var theme = savedTheme || systemTheme;
              var root = document.documentElement;
              
              if (theme === 'dark') {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
              
              // テーマが設定されたことを示すフラグ
              root.setAttribute('data-theme-ready', 'true');
            } catch (e) {
              // エラーが発生した場合はライトテーマをデフォルトに
              document.documentElement.classList.remove('dark');
            }
          })();
        `,
			}}
		/>
	);
}
