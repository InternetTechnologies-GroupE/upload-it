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
define('EXT', ".html");
define('PATH_INFO', $_SERVER["PATH_INFO"]);
$page_folder = "content";
$cache_folder = "content/cache";

if($_SERVER["PATH_INFO"])
{
	$page = file_exists($page_folder.PATH_INFO.EXT) ? PATH_INFO.EXT : '/errors/404'.EXT;
}
else
{
	$page = '/home'.EXT;
}
// Cacheing engine
if (
	ENVIRONMENT=='live' &&
	file_exists($cache_folder.$page) &&
	(filemtime($page_folder.$page) < filemtime($cache_folder.$page)) &&
	(filemtime('index.html') < filemtime($cache_folder.$page)) &&
	(filemtime('index.php') < filemtime($cache_folder.$page))
) {
	include($cache_folder.$page);
	echo "<!-- Cached: ".date('d/m/Y H:i', filemtime($cache_folder.$page))." -->";
	exit;
}

// No cached file found, regenerate
ob_start();
$template = file_get_contents('index.html');					// Load the template
$base_uri = dirname($_SERVER['SCRIPT_NAME']).'/';				//Set the base_uri for relativity
$last_edit = date('F dS Y @ h:i a', filemtime($page_folder.$page));	//Set the time this page was last edited
$content = file_get_contents($page_folder.$page);				// Get the page
$template = str_replace("{content}", $content, $template);
$template = str_replace("{base_uri}", $base_uri, $template);
$template = str_replace("{last_edit}", $last_edit, $template);

echo $template;

$cache = fopen($cache_folder.$page, 'w');				// Open the cached file
fwrite($cache, ob_get_contents());						// Write generated html into the cached file
fclose($fp);											// Close the file
ob_end_flush();											// Send the output to the browser