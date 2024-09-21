mod utils;

use std::{error::Error, fs, io::{BufRead, BufReader}};

use rocket::{catch, catchers, fs::FileServer, get, response::content::RawHtml, routes};
use rocket_dyn_templates::{context, Metadata, Template};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct PostInfo {
	title: String,
	description: String,
	date: String,
	thumbnail: String,
	#[serde(default)]
	filename: String,
}

#[derive(Serialize)]
struct ArtpieceInfo {
	title: String,
	filename: String,
}

impl PostInfo {
	fn from_markdown_file(path: &str) -> Result<PostInfo, Box<dyn Error>> {
		let mut reader = BufReader::new(fs::File::open(path)?);
		let mut buf = String::new();
		match reader.read_line(&mut buf)? {
			0 => Err("Error: File empty")?, // EOF
			_ => {
				if buf.trim() != "---" {
					Err("Error: Expected \"---\"")?
				}
			}
		}
		buf.clear();
		while match reader.read_line(&mut buf)? {
			0 => {
				Err("Error: EOF before terminating \"---\"")?;
				false
			},
			_ => {
				let tbuf = buf.trim();
				if &tbuf[(tbuf.len() - 3)..(tbuf.len())] == "---" {
					false
				} else {
					true
				}
			}
		} {}
		let yaml_str = &buf.trim()[0..buf.trim().len() - 3];
		eprintln!("Extracted YAML from markdown: {yaml_str}");
		let info = serde_yml::from_str::<PostInfo>(&buf.trim()[0..buf.trim().len() - 3])?;
		eprintln!("YAML parse success");

		Ok(info)
	}
}

#[get("/")]
fn index() -> Template {
	let posts: Vec<PostInfo> = utils::ls("content/posts")
		.expect("[ERROR]: There was a problem reading the content of the content/posts directory")
		.into_iter()
		.filter_map(|fname| {
			let mut info = PostInfo::from_markdown_file(&format!("content/posts/{fname}")).ok()?;
			info.filename = format!("/posts/{}", fname.split(".").next()?);
			info.thumbnail = format!("/assets/thumbnails/{}", info.thumbnail);

			Some(info)
		})
		.collect();

	Template::render("index", context! {
		posts
	})
}

#[get("/artboard")]
fn artboard() -> Template {
	let artpieces: Vec<ArtpieceInfo> = utils::ls("content/assets/artboard")
		.expect("[ERROR]: There was a problem reading the content of the content/assets/artboard directory")
		.into_iter()
		.filter_map(|fname| {
			let title = fname.split(".").next().unwrap_or("default_filename").to_string().replace("_", " ");

			let info = ArtpieceInfo {
				title,
				filename: format!("assets/artboard/{fname}")
			};

			Some(info)
		})
		.collect();

	Template::render("artboard", context! {
		artpieces
	})
}

#[catch(404)]
fn not_found() -> Template {
	Template::render("404", context! {})
}

#[get("/<page>")]
fn page(page: String, metadata: Metadata) -> Option<Template> {
	if metadata.contains_template(&page) {
		Some(Template::render(page, context! {}))
	} else {
		None
	}
}

#[get("/posts/<name>")]
fn post(name: String) -> Option<RawHtml<String>> {
	todo!()
}

#[shuttle_runtime::main]
async fn main() -> shuttle_rocket::ShuttleRocket {
	let rocket = rocket::build()
		.mount("/", routes![index, artboard, page])
		.mount("/assets", FileServer::from("content/assets"))
		.register("/", catchers![not_found])
		.attach(Template::fairing());

	Ok(rocket.into())
}
