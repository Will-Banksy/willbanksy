function Qs(query, perElementCallback) {
	if(perElementCallback) {
		let elems = document.querySelectorAll(query);
		for (let i = elems.length - 1; i >= 0; i--) {
			perElementCallback(elems[i]);
		}
		return elems;
	} else {
		return document.querySelectorAll(query);
	}
}

// Theme class. Has the theme name, path to the directory where theme-specific assets (images) are stored, and has all the colours in the theme
class Theme {
	constructor(name, assets_path,
		col_text, col_text_intense, col_accent,
		col_back_light, col_back_mid, col_back_dark, col_back_vdark) {
		this.name = name;
		this.assets_path = assets_path;
		this.col_text = col_text;
		this.col_text_intense = col_text_intense;
		this.col_accent = col_accent;
		this.col_back_light = col_back_light;
		this.col_back_mid = col_back_mid;
		this.col_back_dark = col_back_dark;
		this.col_back_vdark = col_back_vdark;
	}
}

// Let's create some themes!
const themes = [
	new Theme("Fire", "/assets/theme/fire",
		"#fff2b0", "#fade4e", "#e43242", "#a22e41", "#752a3f", "#441d33", "#1c0c18"),
	new Theme("Ocean", "/assets/theme/ocean",
		"#c6fffb", "#39f0e2", "#00cfd3", "#4d8a8b", "#26504f", "#152f2c", "#051917"),
	new Theme("Forest", "/assets/theme/forest",
		"#def2cb", "#83da30", "#22cb3e", "#37a661", "#3b8766", "#2f6152", "#294542")
];

// Switching the theme is not allowed until the page has fully loaded
let acceptSwitchTheme = false;

// When this script is parsed - After page load (cause script is deferred) - Set the theme to the one saved for the user
const defaultThemeIdx = 0;
let storedTheme = sessionStorage.getItem("themeIdx");
let currThemeIdx = storedTheme === null ? defaultThemeIdx : storedTheme;
if(currThemeIdx != defaultThemeIdx) {
	// We can immediately set the theme colours because the :root element is available at this point in loading
	SetThemeColours(currThemeIdx);
}

// When the page is loaded, we can set the icons
window.onload = function OnLoadHandler() {
	let storedTheme = sessionStorage.getItem("themeIdx");
	let currThemeIdx = storedTheme === null ? defaultThemeIdx : storedTheme;
	SetThemeImgs(currThemeIdx); // Don't check if the theme is the default one, because no images are loaded by default
	acceptSwitchTheme = true;
}

function SwitchTheme() {
	if(!acceptSwitchTheme) {
		return;
	}

	let oldThemeIdx = currThemeIdx;

	// Increment theme index
	currThemeIdx++;
	if(currThemeIdx >= themes.length) {
		currThemeIdx = 0;
	}

	// If we've not changed theme (if there's only one theme) then don't bother changing anything in dom
	if(currThemeIdx == oldThemeIdx) {
		return;
	}

	SetThemeColours(currThemeIdx);
	SetThemeImgs(currThemeIdx);

	// Save the theme the user selects in session storage - When the session ends (like when tab closed) then the data will be deleted. Or should I use localStorage to store it forever? I don't like to do that though
	sessionStorage.setItem("themeIdx", currThemeIdx);
}

function SetThemeColours(themeIdx) {
	let currTheme = themes[themeIdx];

	// Set all of the colour variables
	let rootStyle = document.documentElement.style;
	rootStyle.setProperty("--text", currTheme.col_text);
	rootStyle.setProperty("--text-intense", currTheme.col_text_intense);
	rootStyle.setProperty("--accent", currTheme.col_accent);
	rootStyle.setProperty("--back-vdark", currTheme.col_back_vdark);
	rootStyle.setProperty("--back-dark", currTheme.col_back_dark);
	rootStyle.setProperty("--back-mid", currTheme.col_back_mid);
	rootStyle.setProperty("--back-light", currTheme.col_back_light);
}

function SetThemeImgs(themeIdx) {
	let currTheme = themes[themeIdx];

	// Change the images
	Qs(".theme-img-logo", (elem) => {
		elem.src = currTheme.assets_path + "/icon.png";
	});
	Qs(".theme-img-calendar", (elem) => {
		elem.src = currTheme.assets_path + "/calendar.png";
	});
	Qs(".theme-img-github", (elem) => {
		elem.src = currTheme.assets_path + "/github.png";
	});
}