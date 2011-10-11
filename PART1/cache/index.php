<?php

if (!$_SERVER['SERVER_NAME'] OR strpos($_SERVER['SERVER_NAME'], 'local.') !== FALSE OR $_SERVER['SERVER_NAME'] == 'localhost' OR strpos($_SERVER['SERVER_NAME'], '.local') !== FALSE)
{
	define('ENVIRONMENT', 'local');
	error_reporting('E_ALL');
}
else
{
	define('ENVIRONMENT', 'live');
	error_reporting(0);
}

// Detect browser compatibility
$browser = (object) get_browser(null, true);
if(!$browser->javascript) $warnings[] = "Javascript is required"; // Javascript required
if(!$browser->cookies) $warnings[] = "Cookies are required"; // Cookies required
switch($browser->browser):
	case "Firefox":
		if($browser->majorver < 5) $warnings[] = "It is recommended you use Firefox version 5+ <a href=\"#\">Upgrade Now</a>"; // Firefox 5+
		break;
    case "MSIE":
		if($browser->majorver < 7) $warnings[] = "It is recommended you use Internet Explorer 7+ <a href=\"#\">Upgrade Now</a>"; // IE 7+
		break;
	case "Chrome":
		if($browser->majorver < 7) $warnings[] = "It is recommended you use Google Chrome 7+ <a href=\"#\">Upgrade Now</a>"; // Chrome 7+
		break;
	case "Chrome":
		if($browser->majorver < 7) $warnings[] = "It is recommended you use Google Chrome 7+ <a href=\"#\">Upgrade Now</a>"; // Chrome 7+
		break;
	case "Opera":
		if($browser->majorver < 7) $warnings[] = "It is recommended you use Opera 7+ <a href=\"#\">Upgrade Now</a>"; // Chrome 7+
		break;
	default:
		$warnings[] = "Your browser may not be supported by our website."; // Chrome 7+
		break;
endswitch;

// Templating engine
define('PATH_INFO', $_SERVER["PATH_INFO"]);
$page_folder = "content";
$cache_folder = "cache";
$template = "template.html";

if($_SERVER["PATH_INFO"])
{
	$page = file_exists($page_folder.PATH_INFO) ? PATH_INFO : '/errors/404.html';
}
else
{
	$page = '/index.html';
}
// Cacheing engine
if (
	ENVIRONMENT=='live' &&
	file_exists($cache_folder.$page) &&
	(filemtime($page_folder.$page) < filemtime($cache_folder.$page)) &&
	(filemtime($template) < filemtime($cache_folder.$page)) &&
	(filemtime('index.php') < filemtime($cache_folder.$page))
) {
	include($cache_folder.$page);
	echo "<!-- Cached: ".date('d/m/Y H:i', filemtime($cache_folder.$page))." -->";
	exit;
}

// No cached file found, regenerate
ob_start();

// Load the template
$html = file_get_contents($template);

// Put in the page
$html = str_replace("{content}", file_get_contents($page_folder.$page), $html);

//Set the base_uri for relativity
$html = str_replace("{base_uri}",  "" /*dirname($_SERVER['SCRIPT_NAME']).'/'*/, $html);

//Set the time this page was last edited
$html = str_replace("{last_edit}", date('F dS Y @ h:i a', filemtime($page_folder.$page)), $html);

// Send the output to the browser
echo $html;

// Open the cached file
$cache = fopen($cache_folder.$page, 'w');

// Write generated html into the cached file
fwrite($cache, ob_get_contents());

// Close the file
fclose($fp);

ob_end_flush();	