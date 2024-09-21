use std::{fs, io};

pub fn ls(dir: &str) -> Result<Vec<String>, io::Error> {
	let mut names = Vec::new();

	for entry in fs::read_dir(dir)?.into_iter() {
		names.push(entry?.file_name().into_string().unwrap()); // BUG: Unwrap
	}

	Ok(names)
}